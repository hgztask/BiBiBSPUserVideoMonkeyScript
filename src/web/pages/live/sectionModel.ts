import elUtil from "../../core/util/elUtil.ts";
import live_shielding from "../../domain/shielding/live.ts";
import shielding from "../../domain/shielding/main.ts";
import LiveCommon from "./common.ts";
import liveCommon from "./common.ts";
import localMKData, {isDelLivePageRightSidebarGm, isLiveSectionResponseRewriteGm, isRoomListAdaptiveGm} from "../../state/localMKData.ts";
import cssManager from "../../domain/cssManager.ts";
import urlUtil from "../../core/util/urlUtil.ts";

// 判断是否是直播分区
const isLiveSection = (url: any = window.location.href) => {
    return url.includes("live.bilibili.com/p/eden/area-tags")
}
/**
 * 获取直播分区中直播列表数据
 * @returns {Promise<[{liveUrl,name,title,partition,popularity}]>}
 */
const getRoomCardDataList = async () => {
    const elList = await elUtil.findElements("#room-card-list>div");
    const list: any[] = [];
    for (let el of elList) {
        const cardEL = el.querySelector("#card");
        if (!cardEL) continue;
        const vueExample = cardEL.__vue__;
        const props = vueExample.$props;
        const uid = props.anchorId;
        //直播用户
        const name = props.anchorName;
        //直播标题
        const title = props.roomTitle;
        const titleEl = el.querySelector('.Item_roomTitle_ax3eD');
        if (titleEl) {
            titleEl.title = title;
        }
        //直播房间号
        const roomId = props.roomId;
        //分区
        const partition = props.areaName;
        //人气
        const popularity = props.watchedShow.num;
        //直播封面
        const roomCover = props.roomCover;
        //直播链接
        const liveUrl = "https://live.bilibili.com/" + roomId;
        const insertionPositionEl = el;
        const explicitSubjectEl = el;
        list.push({
            liveUrl, name, uid, roomId, title,
            partition, popularity, roomCover,
            insertionPositionEl,
            explicitSubjectEl,
            el
        });
    }
    return list;
}

const startShieldingLiveRoom = async () => {
    const liveList = await getRoomCardDataList();
    for (let liveData of liveList) {
        if (live_shielding.shieldingLiveRoomDecorated(liveData)) continue;
        shielding.addBlockButton({data: liveData, maskingFunc: startShieldingLiveRoom}, 'gz_shielding_live_room_button')
    }
}

//直播分区业务逻辑

// —— 饥饿恢复：屏蔽删除大部分卡片后，列表高度不足视口、页面滚动加载永不触发 ——
// 页面只监听 document 的 scroll 事件，饥饿态下文档高度 < 视口，无滚动空间故 scroll 永不触发。
// 点击"加载更多"按钮：临时撑高文档恢复滚动能力 → 真实滚动到底 → 触发页面自身 fetch 加载。
// 撑高在整个补满循环期间保持，循环结束（满屏/到底/无新批次/达上限）后一次性复原，
// 避免旧实现每轮 1.5s 复原再撑高造成的列表跳动，以及 prevMinHeight 在循环中被污染的残留问题。

/** 单轮补满的最大触发次数：防止整批全被屏蔽但页面仍持续返回新批次时无限请求 */
const maxFillRounds = 10;
/** 触发一次后等待页面 getList 响应的时限：超过视为到底/页面不再续载 */
const responseWaitTimeout = 4000;
/** 列表底部需超出视口的余量：确保页面自身滚动加载条件被满足 */
const fillViewportMargin = 200;
/** getList 请求的 URL 特征，与 observeNetwork 中的判定保持一致 */
const getListUrlKeyword = 'api.live.bilibili.com/xlive/web-interface/v1/second/getList';

let loadMoreButton: HTMLElement | null = null;
/** 补满循环进行中标记：避免并发触发导致撑高状态管理混乱 */
let fillViewportRunning = false;

/** 临时撑高文档，恢复滚动能力（幂等；原始内联高度存入 dataset，复原时写回，不影响页面/其它脚本设置的高度） */
const raiseDocumentHeight = (): void => {
    if (document.body.dataset.gzLiveRaised !== undefined) return;
    document.body.dataset.gzLiveRaised = document.body.style.minHeight;
    document.body.style.minHeight = `${window.innerHeight + fillViewportMargin}px`;
}

/** 复原撑高（写回 raise 时保存的原始内联高度） */
const restoreDocumentHeight = (): void => {
    const original = document.body.dataset.gzLiveRaised;
    if (original === undefined) return;
    delete document.body.dataset.gzLiveRaised;
    document.body.style.minHeight = original;
}

/**
 * 等待一次新的 getList 响应到达（以网络事件为准而非卡片数变化：
 * 整批被响应层过滤时卡片数不变，若按卡片数判会误判为到底）。
 * 观察器回调只接收 observe() 之后新产生的条目，历史条目不会混入；
 * 不能读 performance 全量缓冲做基线——主脚本的网络观察器会定期
 * clearResourceTimings() 清空缓冲，索引基线在清空后会永久失效。
 */
const waitForListResponse = (): Promise<boolean> => {
    return new Promise(resolve => {
        let settled = false;
        const finish = (arrived: boolean): void => {
            if (settled) return;
            settled = true;
            observer.disconnect();
            clearTimeout(timer);
            resolve(arrived);
        }
        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (entry.name.includes(getListUrlKeyword)) {
                    finish(true);
                    return;
                }
            }
        });
        observer.observe({entryTypes: ['resource']});
        const timer = setTimeout(() => finish(false), responseWaitTimeout);
    });
}

/**
 * 当前列表底部是否已超出视口（即页面恢复自然滚动加载条件）。
 * 用文档坐标（rect.bottom + scrollY）而非视口坐标判断：
 * 补满循环期间页面始终停在文档底部，视口坐标恒接近视口底，无法反映真实列表高度。
 */
const isListFilledViewport = (): boolean => {
    const list = document.querySelector('#room-card-list');
    if (!list) return true;
    const rect = list.getBoundingClientRect();
    return rect.bottom + window.scrollY > window.innerHeight + fillViewportMargin;
}

/** 等待列表变化静默的窗口：连续这么久无卡片增删视为渲染+过滤已 settle */
const settleQuietWindow = 300;
/** settle 等待总上限：即使列表仍在缓慢变化也强制继续，避免卡死循环 */
const settleMaxWait = 2500;

/**
 * 等待 #room-card-list 渲染与过滤 settle（卡片增删静默）。
 * 不用固定延时：慢判定场景下响应层过滤可能滞后于渲染，固定 400ms 会在
 * 过滤完成前测量高度造成假阳性满屏；静默探测能正确覆盖快/慢两条路径。
 */
const waitForListSettle = (): Promise<void> => {
    return new Promise(resolve => {
        const list = document.querySelector('#room-card-list');
        if (!list) return resolve();
        let settled = false;
        let quietTimer: ReturnType<typeof setTimeout>;
        const finish = (): void => {
            if (settled) return;
            settled = true;
            observer.disconnect();
            clearTimeout(quietTimer);
            clearTimeout(deadlineTimer);
            resolve();
        }
        const observer = new MutationObserver(() => {
            clearTimeout(quietTimer);
            quietTimer = setTimeout(finish, settleQuietWindow);
        });
        observer.observe(list, {childList: true});
        quietTimer = setTimeout(finish, settleQuietWindow);
        const deadlineTimer = setTimeout(finish, settleMaxWait);
    });
}

/** 点击按钮：触发一次滚动加载，并循环补满直到列表超出视口或页面不再返回新批次 */
const fillViewport = async (): Promise<void> => {
    if (fillViewportRunning) return;
    fillViewportRunning = true;
    try {
        raiseDocumentHeight();
        let lastScrollTarget = -1;
        let anyResponseArrived = false;
        for (let round = 0; round < maxFillRounds; round++) {
            // 每轮递增撑高量：整批被过滤时文档高度不变，scrollTo 到同一位置
            // 不会产生 scroll 事件、页面不会续载；递增保证滚动目标每轮都在变化
            document.body.style.minHeight = `${window.innerHeight + fillViewportMargin * (round + 2)}px`;
            const scrollTarget = document.body.scrollHeight;
            if (scrollTarget === lastScrollTarget) break;
            lastScrollTarget = scrollTarget;
            // 先武装响应观察器再滚动，避免观察器就绪前响应已到达的竞态
            const responsePromise = waitForListResponse();
            window.scrollTo(0, scrollTarget);
            // 以 getList 响应到达作为"页面确实续载了"的信号
            const arrived = await responsePromise;
            if (!arrived) break;
            anyResponseArrived = true;
            // 等列表渲染与响应层过滤 settle 后再测量高度
            await waitForListSettle();
            if (isListFilledViewport()) break;
        }
        // 整轮补满一次 getList 响应都没有 = 分区确实到底，饥饿提示进入冷却
        if (!anyResponseArrived) {
            listExhaustedAt = Date.now();
        }
    } finally {
        restoreDocumentHeight();
        fillViewportRunning = false;
        // 补满结束后立即重新评估提示态（满屏→熄灭；到底→进入冷却熄灭）
        updateLoadMoreButtonForStarvation();
    }
}

const insertLoadMoreButton = (): void => {
    if (loadMoreButton && document.body.contains(loadMoreButton)) return;
    const button = document.createElement('div');
    button.id = 'gz_live_section_load_more_button';
    button.textContent = '加载更多直播间';
    Object.assign(button.style, {
        position: 'fixed',
        right: '20px',
        bottom: '80px',
        zIndex: '99999',
        padding: '8px 16px',
        borderRadius: '20px',
        background: 'rgba(0, 161, 214, 0.9)',
        color: '#fff',
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
    } as CSSStyleDeclaration);
    button.addEventListener('click', () => void fillViewport());
    document.body.appendChild(button);
    loadMoreButton = button;
    // 按钮重建后缓存态失效，置 null 强制下次评估刷新提示态
    buttonStarvingState = null;
}

/** 首次评估延迟：等页面首屏渲染与响应层过滤完成后再评估列表是否过短 */
const firstScreenDelay = 1500;
/** 列表评估防抖间隔 */
const hintDebounceDelay = 300;
/** 点击补满但一轮响应都没等到（分区到底）后，饥饿提示的静默冷却时长 */
const exhaustedCooldown = 60000;
/** 饥饿提示是否已启动（每页只启动一次） */
let starvationHintStarted = false;
/** 按钮当前是否处于饥饿提示态（null=未初始化，强制首次刷新） */
let buttonStarvingState: boolean | null = null;
/** 最近一次确认分区到底的时刻：冷却期内不再提示，避免"到底了还一直亮" */
let listExhaustedAt = 0;
let hintUpdateScheduled = false;

/** 注入饥饿提示样式（红色呼吸动画） */
const injectStarvationHintStyle = (): void => {
    if (document.getElementById('gz_live_section_load_more_style')) return;
    const style = document.createElement('style');
    style.id = 'gz_live_section_load_more_style';
    style.textContent = `
@keyframes gz_live_starvation_pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.55); }
    50% { box-shadow: 0 0 0 10px rgba(255, 82, 82, 0); }
}
#gz_live_section_load_more_button.gz-starving {
    background: rgba(255, 82, 82, 0.95) !important;
    animation: gz_live_starvation_pulse 1.2s ease-in-out infinite;
}`;
    (document.head || document.documentElement)?.appendChild(style);
}

/**
 * 评估列表是否被过滤得过短，并同步按钮的饥饿提示态。
 * 检测到不满一屏时按钮变红呼吸并改文案，明确告知用户"脚本已检测到该问题，
 * 请手动点击补满"，而非无声处理让用户误以为脚本失效。
 */
const updateLoadMoreButtonForStarvation = (): void => {
    const button = loadMoreButton;
    if (!button || !document.body.contains(button)) return;
    const starving = !fillViewportRunning
        && Date.now() - listExhaustedAt > exhaustedCooldown
        && !isListFilledViewport();
    if (buttonStarvingState === starving) return;
    buttonStarvingState = starving;
    if (starving) {
        button.classList.add('gz-starving');
        button.textContent = '屏蔽后列表过短，点击补满一屏';
    } else {
        button.classList.remove('gz-starving');
        button.textContent = '加载更多直播间';
    }
}

/**
 * 饥饿提示：响应层过滤后列表不满一屏（页面自身滚动加载不会触发）时，
 * 按钮变红呼吸提示用户手动点击补满。列表增删后自动重新评估；
 * 仅在响应层过滤开关开启时启动——关闭时首屏不过滤，不存在饥饿。
 */
const startStarvationHint = (): void => {
    if (starvationHintStarted || !isLiveSectionResponseRewriteGm()) return;
    starvationHintStarted = true;
    injectStarvationHintStyle();
    const scheduleUpdate = (): void => {
        if (hintUpdateScheduled) return;
        hintUpdateScheduled = true;
        window.setTimeout(() => {
            hintUpdateScheduled = false;
            updateLoadMoreButtonForStarvation();
        }, hintDebounceDelay);
    }
    // 监听 body：覆盖首屏列表未挂载、响应层过滤删除、页面续载新增、DOM层兜底删除等变化
    new MutationObserver(scheduleUpdate).observe(document.body, {childList: true, subtree: true});
    window.setTimeout(scheduleUpdate, firstScreenDelay);
}

const run = () => {
    LiveCommon.addStyle();
    cssManager.liveStreamPartitionStyle(isRoomListAdaptiveGm());
    liveCommon.setLivePageRightSidebarHide(isDelLivePageRightSidebarGm())
    insertLoadMoreButton()
    startStarvationHint()
}

export default {
    isLiveSection, run,
    startShieldingLiveRoom,
    //检查顶部分区面板索引列表
    startCheckTopLiveRoomTagList(url: string) {
        const parseUrl = urlUtil.parseUrl(url);
        const {
            /**
             * 3 手游
             * 2 网游
             * 6 单机游戏
             */
            parentAreaId = '0',
            /**
             * 子分区id
             * 0 为全部，这时顶部·的区块列表为全部，不折叠展示
             */
            areaId = '0'
        } = parseUrl.queryParams;
        //只处理手游、网游、单机游戏主分区
        if (!(parentAreaId === '3' || parentAreaId === "2" || parentAreaId === "6")) return
        if (areaId === '0') {
            this.startLoadTopLiveRoomTagList(parseUrl)
            return
        }
        console.log('非全部，查找切换分区按钮')
        elUtil.byXpathElAsync('//div[@id="area-tags"]//div[contains(@class,"index_switch_area") and contains(.,"切换分区")]').then(switchDiv => {
            if (!switchDiv) return
            console.log('已找到切换分区按钮')
            const dataLabelKey = 'data-label'
            const dataLabel = switchDiv.getAttribute(dataLabelKey);
            if (dataLabel !== null) return console.log('已添加过切换分区按钮监听')
            switchDiv.setAttribute(dataLabelKey, '切换分区')
            switchDiv.addEventListener('click', () => {
                console.log('点击了切换分区')
                this.startLoadTopLiveRoomTagList(parseUrl)
            })
            console.log('切换分区按钮已添加监听')
        })
    },
    //载入顶部tag分区索引处理
    startLoadTopLiveRoomTagList(parseUrl: ReturnType<typeof urlUtil.parseUrl>) {
        const {
            /**
             * 3 手游
             * 2 网游
             * 6 单机游戏
             */
            parentAreaId = '0',
            /**
             * 子分区id
             * 0 为全部，这时顶部·的区块列表为全部，不折叠展示
             */
            areaId = '0'
        } = parseUrl.queryParams;
        let keepList: string[] = [];
        switch (parentAreaId) {
            case "3":
                if (!localMKData.isMobileGamePartitionTagOnlyShowStatus()) return
                keepList = localMKData.getMobileGamePartitionTagOnlyShowList()
                break;
            case"2":
                if (!localMKData.isGamePartitionTagOnlyShowStatus()) return
                keepList = localMKData.getGamePartitionTagOnlyShowList()
                break;
            case "6":
                if (!localMKData.isSingleGamePartitionTagOnlyShowStatus()) return
                keepList = localMKData.getSingleGamePartitionTagOnlyShowList()
                break;
        }
        const selector = areaId === '0' ? '#area-tags section>div>button[class^="index_tag_"]' : '#area-tags header[class^="index_header"]>section>a'
        console.log(parentAreaId, areaId)
        elUtil.findElements(selector, {interval: 200, timeout: 5000}).then(elList => {
            for (let el of elList) {
                const label = el.textContent.trim();
                if (keepList.includes(label)) continue
                el.style.display = 'none'
            }
        })
    }
}
