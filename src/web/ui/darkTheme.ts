/**
 * 主面板深色主题适配
 *
 * B 站深色主题通过 html/body 上的 bili_dark 类标记。脚本主面板与弹窗均使用 Element Plus，
 * EP 官方深色变量包（theme-chalk/dark/css-vars.css）本应挂在 html.dark 选择器下生效，
 * 但 B 站页面自身不用 EP、且不能依赖其 html 类状态，因此：
 * 1. 通过 @resource 声明 EP 深色 css（unpkg CDN），运行时用 GM_getResourceText 读取，无跨域弹窗；
 * 2. 将选择器 html.dark 改写为 :root，使深色 CSS 变量对全局 EP 组件生效（面板/弹窗/其他脚本 EP 组件）；
 * 3. MutationObserver 监听 html/body 的 bili_dark 类变化，实时注入/移除深色变量 style，随 B 站主题同步；
 * 4. 资源读取失败时降级为浅色（保持现状，不阻塞面板）。
 */

/** @resource 中声明的深色 css 资源名（见 tamper_monkey.json @resource） */
const DARK_CSS_RESOURCE_NAME = 'gzDarkCss';

/** 注入深色变量的 style 节点 id */
const DARK_STYLE_ID = 'gz-dark-theme';

/** 已读取的深色 css 文本缓存（改写选择器后），避免重复读取 */
let cachedDarkCss: string | null = null;

/** 是否已读取过（读取失败也置位，避免反复尝试） */
let prefetched = false;

/** 当前是否已注入深色 style（避免重复注入） */
let darkStyleInjected = false;

/** MutationObserver 实例，避免重复创建 */
let observer: MutationObserver | null = null;

/**
 * 判断当前是否 B 站深色主题
 * @returns 是否深色
 */
const isBiliDark = (): boolean => {
    return document.documentElement.classList.contains('bili_dark')
        || document.body.classList.contains('bili_dark');
}

/**
 * 将 EP 深色 css 的选择器从 html.dark 改写为 :root
 * EP 深色变量包以 html.dark{...} 定义变量，另有 html.dark .el-button 等派生规则；
 * 改写为 :root 后变量作用于文档根，全局 EP 组件（面板/弹窗等）均能继承深色变量。
 * @param cssText 原始深色 css 文本
 * @returns 改写后的 css 文本
 */
const rewriteSelectorToRoot = (cssText: string): string => {
    // html.dark{...} -> :root{...}
    // html.dark .el-button{...} -> :root .el-button{...}
    return cssText.replace(/html\.dark/g, ':root');
}

/**
 * 读取 @resource 声明的 EP 深色 css 并缓存改写后的文本
 * @returns 是否读取成功
 */
const prefetchDarkCss = async (): Promise<boolean> => {
    if (prefetched) return cachedDarkCss !== null;
    prefetched = true;
    try {
        const cssText = GM_getResourceText(DARK_CSS_RESOURCE_NAME);
        if (cssText) {
            cachedDarkCss = rewriteSelectorToRoot(cssText);
        }
    } catch (e) {
        // 读取失败：保持浅色，不阻塞面板
        console.warn('[gz][dark] EP 深色资源读取失败，面板保持浅色', e);
    }
    return cachedDarkCss !== null;
}

/**
 * 注入深色变量 style（幂等）
 */
const injectDarkStyle = (): void => {
    if (darkStyleInjected || cachedDarkCss === null) return;
    if (document.head.querySelector('#' + DARK_STYLE_ID) !== null) {
        darkStyleInjected = true;
        return;
    }
    const styleEl = document.createElement('style');
    styleEl.id = DARK_STYLE_ID;
    styleEl.textContent = cachedDarkCss;
    document.head.appendChild(styleEl);
    darkStyleInjected = true;
}

/**
 * 移除深色变量 style（幂等）
 */
const removeDarkStyle = (): void => {
    if (!darkStyleInjected) return;
    const styleEl = document.head.querySelector('#' + DARK_STYLE_ID);
    if (styleEl) {
        styleEl.remove();
    }
    darkStyleInjected = false;
}

/**
 * 根据当前 B 站主题状态同步深色 style 的注入/移除
 */
const syncDarkTheme = (): void => {
    if (isBiliDark()) {
        injectDarkStyle();
    } else {
        removeDarkStyle();
    }
}

/**
 * 启动深色主题同步：读取资源 + 监听 bili_dark 类变化
 */
const startDarkThemeSync = (): void => {
    // 同步读取深色 css 资源（GM_getResourceText 为同步 API）
    prefetchDarkCss();

    // 监听 html/body 的 class 变化，实时同步
    if (observer) return;
    observer = new MutationObserver(() => {
        syncDarkTheme();
    });
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
    observer.observe(document.body, {attributes: true, attributeFilter: ['class']});

    // 初始同步
    syncDarkTheme();
}

export default {
    isBiliDark,
    prefetchDarkCss,
    startDarkThemeSync,
}
