/** 屏蔽检查结果 */
export interface BlockResult {
    /** 是否命中屏蔽规则 */
    state: boolean;
    /** 屏蔽类型名称 */
    type?: string;
    /** 匹配到的具体值 */
    matching?: string | number | boolean;
    /** 附加说明消息 */
    msg?: string;
}

/** 屏蔽按钮相关数据 */
export interface BlockButtonData {
    data: {
        /** 插入位置的父元素 */
        insertionPositionEl: HTMLElement;
        /** 控制按钮显隐的主体元素 */
        explicitSubjectEl?: HTMLElement;
        /** CSS样式键值对 */
        cssMap?: Record<string, string>;
        /** CSS文本内容 */
        cssText?: string;
        /** 目标元素 */
        el?: HTMLElement;
        /** 用户uid */
        uid?: number;
        /** 用户名称 */
        name?: string;
        /** 视频BV号 */
        bv?: string;
        /** 视频标题 */
        title?: string;
        /** 直播间ID */
        roomId?: number | string;
        /** 装扮图片信息 */
        decoratePic?: any;
        /** 装扮收藏集ID */
        collectionActId?: number;
        /** 装扮ID */
        dressUpId?: number;
        /** 按钮定位方向数组，如["right","bottom"] */
        position?: string[];
        /** 用户主页URL */
        userUrl?: string;
        [key: string]: any;
    };
    /** 更新数据回调，返回最新数据 */
    updateFunc?: (el: HTMLElement) => any;
    /** 屏蔽操作回调 */
    maskingFunc?: () => void;
    /** 鼠标悬停按钮时回调 */
    mouseoverFun?: (buttonEl: HTMLElement) => void;
}

/** 精确匹配、模糊匹配和正则匹配的规则配置 */
export interface ExactFuzzyMatchConfig {
    /** 精确匹配规则的GM存储键名 */
    exactKey?: string;
    /** 精确匹配类型显示名称 */
    exactTypeName?: string;
    /** 精确匹配规则数组 */
    exactRuleArr?: (string | number)[];
    /** 模糊匹配规则的GM存储键名 */
    fuzzyKey?: string;
    /** 模糊匹配类型显示名称 */
    fuzzyTypeName?: string;
    /** 模糊匹配规则数组 */
    fuzzyRuleArr?: string[];
    /** 正则匹配规则的GM存储键名 */
    regexKey?: string;
    /** 正则匹配类型显示名称 */
    regexTypeName?: string;
    /** 正则匹配规则数组 */
    regexRuleArr?: string[];
}

/** 视频分辨率维度 */
export interface Dimension {
    /** 宽度 */
    width: number;
    /** 高度 */
    height: number;
}

/** 视频创作团队成员 */
export interface TeamMember {
    /** 成员uid */
    mid: number;
    /** 成员名称 */
    name: string;
}

/** 时间范围屏蔽配置项 */
export interface TimeRangeItem {
    /** 时间范围是否启用 */
    status: boolean;
    /** 时间戳起止范围，13位毫秒级 */
    r: [number, number];
}

/** 动态内容屏蔽的规则数组映射 */
export interface DynamicContentRuleArrMap {
    /** 模糊匹配规则数组 */
    fuzzyRuleArr?: string[];
    /** 正则匹配规则数组 */
    regexRuleArr?: string[];
}
