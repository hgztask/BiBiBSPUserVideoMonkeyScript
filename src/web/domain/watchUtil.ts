type UrlChangeCallback = (newUrl: string, oldUrl: string, title: string) => void

type NetworkCallback = (url: string, windowUrl: string, winTitle: string, initiatorType: string) => void

type ImgCallback = (url: string, windowUrl: string, winTitle: string) => void

interface WatchElementListLengthCallbackData {
    action: 'add' | 'del'
    elements: NodeListOf<Element>
    length: number
}

type WatchElementListLengthCallback = (data: WatchElementListLengthCallbackData) => void

interface WatchElementListLengthConfig {
    interval?: number
}

type StopWatcher = () => void

interface WatchChildAppearOptions {
    once?: boolean
    initialCheck?: boolean
    subtree?: boolean
}

interface WatchChildAppearResult {
    disconnect: () => void
}

const addEventListenerUrlChange = (callback: UrlChangeCallback): void => {
    let oldUrl: string = window.location.href;
    setInterval(() => {
        const newUrl: string = window.location.href;
        if (oldUrl === newUrl) return;
        oldUrl = newUrl;
        const title: string = document.title;
        callback(newUrl, oldUrl, title)
    }, 1000);
}

const addEventListenerNetwork = (callback: NetworkCallback, imgCallBack?: ImgCallback): void => {
    const performanceObserver: PerformanceObserver = new PerformanceObserver(() => {
        const entries: PerformanceEntryList = performance.getEntriesByType('resource');
        const windowUrl: string = window.location.href;
        const winTitle: string = document.title;
        for (let entry of entries) {
            const url: string = entry.name;
            const initiatorType: string = (entry as PerformanceResourceTiming).initiatorType;
            if (initiatorType === "img" && imgCallBack) {
                imgCallBack(url, windowUrl, winTitle)
            }
            if (initiatorType === "img" || initiatorType === "css" || initiatorType === "link" || initiatorType === "beacon") {
                continue;
            }
            try {
                callback(url, windowUrl, winTitle, initiatorType);
            } catch (e: any) {
                if (e.message === "stopPerformanceObserver") {
                    performanceObserver.disconnect();
                    console.log("检测到当前页面在排除列表中，已停止性能观察器对象实例", e)
                    break;
                }
                throw e;
            }
        }
        performance.clearResourceTimings();
    });
    performanceObserver.observe({entryTypes: ['resource']});
}

function watchElementListLengthWithInterval(selector: string, callback: WatchElementListLengthCallback, config: WatchElementListLengthConfig = {}): StopWatcher {
    const defConfig: WatchElementListLengthConfig = {};
    config = {...defConfig, ...config};
    let previousLength: number = -1;
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
            if (previousLength === -1) {
                previousLength = document.querySelectorAll(selector).length;
                return
            }
            const currentElements: NodeListOf<Element> = document.querySelectorAll(selector);
            const currentLength: number = currentElements.length;
            if (currentLength !== previousLength) {
                previousLength = currentLength;
                callback({
                        action: currentLength > previousLength ? 'add' : 'del',
                        elements: currentElements,
                        length: currentLength
                    }
                );
            }
        },
        config.interval
    );
    const stop: StopWatcher = () => {
        clearInterval(timer);
    };
    return stop;
}

export default {
    addEventListenerUrlChange,
    addEventListenerNetwork,
    watchElementListLengthWithInterval,
    watchChildAppear(parent: Element, selector: string, callback: (el: Element) => void, options: WatchChildAppearOptions = {}): WatchChildAppearResult {
        if (!parent || !(parent instanceof Element)) {
            throw new Error('parent 必须是一个有效的 DOM 元素');
        }
        if (typeof selector !== 'string') {
            throw new Error('selector 必须是字符串');
        }
        if (typeof callback !== 'function') {
            throw new Error('callback 必须是函数');
        }

        const {
            once = false,
            initialCheck = true,
            subtree = false
        } = options;

        function findMatches(): Element[] {
            if (subtree) {
                return Array.from(parent.querySelectorAll(selector));
            } else {
                return Array.from(parent.children).filter(child => child.matches(selector));
            }
        }

        let hadMatches: boolean = false;

        function checkAndTrigger(): void {
            const matches: Element[] = findMatches();
            const hasMatches: boolean = matches.length > 0;

            if (hasMatches && !hadMatches) {
                callback(matches[0]);

                if (once) {
                    observer.disconnect();
                    return;
                }
            }
            hadMatches = hasMatches;
        }

        if (initialCheck) {
            hadMatches = findMatches().length > 0;
            if (hadMatches) {
                callback(findMatches()[0]);
                if (once) {
                    return {
                        disconnect: () => {
                        }
                    };
                }
            }
        } else {
            hadMatches = findMatches().length > 0;
        }

        const observer: MutationObserver = new MutationObserver(() => {
            checkAndTrigger();
        });

        observer.observe(parent, {
            childList: true,
            subtree: subtree
        });

        return {
            disconnect: () => observer.disconnect()
        };
    }
}
