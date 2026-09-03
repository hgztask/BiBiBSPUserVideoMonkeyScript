import {danmakuStore} from "./videoDanmakuFilter.ts";
import crc32Util from "../core/util/crc32Util.ts";
import bFetch from "../core/http/bFetch.ts";

/**
 * 弹幕详情检查器（复现 pakku 的 Ctrl 审查交互）
 *
 * 按住 Ctrl 时高亮播放器内的弹幕并允许点击，
 * 点击后弹出面板展示弹幕详情，并通过 CRC32 求逆破解出发送者 uid，
 * 再调用 B站接口补充昵称与等级
 */

// ==================== 样式 ====================

const INSPECT_CLASS = 'mk-dm-inspect';

const PANEL_CSS = `
.${INSPECT_CLASS} {
    pointer-events: auto !important;
}
.${INSPECT_CLASS} .bili-danmaku-x-dm {
    pointer-events: auto;
    cursor: pointer;
    background: rgba(0, 161, 214, 0.45);
}
.mk-dm-panel {
    position: absolute;
    top: 15%;
    right: 12px;
    z-index: 9999;
    max-width: 380px;
    background: rgba(22, 24, 26, 0.95);
    color: #eee;
    border: 1px solid #555;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 13px;
    line-height: 1.6;
    text-align: left;
    user-select: text;
}
.mk-dm-panel .mk-dm-panel-title {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-weight: bold;
    margin: 0 0 6px;
    word-break: break-all;
}
.mk-dm-panel .mk-dm-panel-close {
    flex-shrink: 0;
    border: none;
    background: transparent;
    color: #aaa;
    font-size: 16px;
    cursor: pointer;
    padding: 0 2px;
}
.mk-dm-panel .mk-dm-panel-close:hover {
    color: #fff;
}
.mk-dm-panel hr {
    border: none;
    border-top: 1px solid #444;
    margin: 6px 0;
}
.mk-dm-panel .mk-dm-panel-orig {
    color: #bbb;
    word-break: break-all;
}
.mk-dm-panel .mk-dm-panel-footer a {
    color: #00a1d6;
    text-decoration: none;
}
.mk-dm-panel .mk-dm-panel-footer a:hover {
    text-decoration: underline;
}
`;

GM_addStyle(PANEL_CSS);

// ==================== 工具 ====================

const getDanmakuWrap = (): HTMLElement | null =>
    document.querySelector('.bpx-player-row-dm-wrap');

/** 秒数格式化为 0:52.17 形式 */
const formatStime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(2).padStart(5, '0');
    return `${m}:${s}`;
};

/** 时间戳格式化为 yy/m/d hh:mm 形式 */
const formatDate = (unixSeconds: number): string => {
    if (!unixSeconds) return '';
    const d = new Date(unixSeconds * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${String(d.getFullYear()).slice(2)}/${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ==================== 面板 ====================

let panelEl: HTMLDivElement | null = null;

const closePanel = (): void => {
    panelEl?.remove();
    panelEl = null;
}

const buildPanel = (playerBox: HTMLElement): HTMLDivElement => {
    closePanel();
    const panel = document.createElement('div');
    panel.className = 'mk-dm-panel';
    playerBox.appendChild(panel);
    panelEl = panel;
    return panel;
}

const showDanmakuPanel = (dmEl: HTMLElement): void => {
    const wrap = getDanmakuWrap();
    const playerBox = wrap ? (wrap.parentElement ?? wrap) : null;
    if (!playerBox) return;

    const text = dmEl.textContent ?? '';
    // 从数据存储中按文本匹配，取出现时间最接近当前播放进度的那条
    const now = document.querySelector('video')?.currentTime ?? 0;
    let best: any = null, bestDelta = Infinity;
    for (const item of danmakuStore.values()) {
        if (item.text !== text) continue;
        const delta = Math.abs((item.stime ?? 0) - now);
        if (delta < bestDelta) {
            bestDelta = delta;
            best = item;
        }
    }

    const panel = buildPanel(playerBox);
    panel.innerHTML = `
        <p class="mk-dm-panel-title">
            <button class="mk-dm-panel-close" type="button">×</button>
            <span class="mk-dm-panel-text"></span>
        </p>
        <hr>
        <div class="mk-dm-panel-orig"></div>
        <div class="mk-dm-panel-footer"></div>`;
    panel.querySelector('.mk-dm-panel-text')!.textContent = text;
    panel.querySelector('.mk-dm-panel-close')!.addEventListener('click', closePanel);

    if (!best) {
        panel.querySelector('.mk-dm-panel-footer')!.textContent = '未找到该弹幕的数据（可能加载早于数据记录）';
        return;
    }

    panel.querySelector('.mk-dm-panel-orig')!.textContent =
        `ORIG ${formatStime(best.stime ?? 0)} ${best.size ?? '?'}px W${best.weight ?? '?'} ${formatDate(best.date)}`;

    const footer = panel.querySelector('.mk-dm-panel-footer')!;
    footer.textContent = '破解uid中...';

    // 破解 uhash 得到候选 uid，逐个查询账号信息直到有效
    (async () => {
        const candidates = crc32Util.crackUhashCandidates(best.uhash, 10);
        for (const uid of candidates) {
            const info = await bFetch.fetchUserInfoByMid(uid);
            if (info) {
                footer.innerHTML = '';
                const link = document.createElement('a');
                link.href = `//space.bilibili.com/${info.uid}`;
                link.target = '_blank';
                link.textContent = `${info.uid} Lv${info.level} ${info.name}`;
                footer.appendChild(link);
                return;
            }
        }
        footer.textContent = `未能破解出有效uid（uhash: ${best.uhash}）`;
    })();
}

// ==================== 交互安装 ====================

let inspectOn = false;

const setInspect = (on: boolean): void => {
    if (inspectOn === on) return;
    inspectOn = on;
    getDanmakuWrap()?.classList.toggle(INSPECT_CLASS, on);
}

const installInspector = (): void => {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Control') setInspect(true);
    }, true);
    window.addEventListener('keyup', (e: KeyboardEvent) => {
        if (e.key === 'Control') setInspect(false);
    }, true);
    window.addEventListener('blur', () => setInspect(false));
    // 捕获阶段拦截，避免点击穿透到播放器（暂停/播放）
    document.addEventListener('click', (e: MouseEvent) => {
        if (!inspectOn || !e.ctrlKey) return;
        const target = e.target as HTMLElement;
        const dmEl = target.closest?.('.bili-danmaku-x-dm');
        if (!dmEl) return;
        e.preventDefault();
        e.stopPropagation();
        showDanmakuPanel(dmEl as HTMLElement);
    }, true);
}

installInspector();

export default {
    setInspect
}
