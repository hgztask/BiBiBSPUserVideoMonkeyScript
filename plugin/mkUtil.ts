import fs from "fs";

interface TamperMetaOpts {
    name?: string;
    namespace?: string;
    version?: string;
    description?: string;
    author?: string;
    icon?: string;
    license?: string;
    homepageURL?: string;
    supportURL?: string;
    updateURL?: string;
    downloadURL?: string;
    match?: string[];
    include?: string[];
    exclude?: string[];
    grant?: string[];
    connect?: string[];
    require?: string[];
    resource?: string[];
    antifeature?: string[];
    runAt?: string;
    noFrames?: boolean;
}

interface TamperMonkeyResult {
    notDevData: Record<string, unknown>;
    devData: Record<string, unknown>;
}

export default {
    /**
     * 动态生成【格式对齐】的油猴Tampermonkey头部元数据
     * @param opts 配置对象
     * @returns 标准对齐的油猴头部字符串
     */
    generateTamperMeta(opts: TamperMetaOpts = {}): string {
        // 默认兜底配置 + 补全所有油猴缺失字段
        const defaultOpts: Required<TamperMetaOpts> = {
            name: "自定义脚本",
            namespace: "https://tampermonkey.net/",
            version: "1.0.0",
            description: "油猴脚本",
            author: "作者",
            icon: "",
            license: "MIT",
            homepageURL: "",
            supportURL: "",
            updateURL: "",
            downloadURL: "",
            match: [],
            include: [],
            exclude: [],
            grant: ['unsafeWindow', 'GM_setValue', 'GM_getValue'],
            connect: [],
            require: [],
            resource: [],
            antifeature: [],
            runAt: "document-end",
            noFrames: false
        };

        // 合并用户配置
        const conf = {...defaultOpts, ...opts};
        const lines = ["// ==UserScript=="];
        const baseFields: [string, string][] = [];

        // 收集所有基础配置项（补全缺失字段）
        for (const [key, val] of [
            ["@name", conf.name],
            ["@namespace", conf.namespace],
            ["@version", conf.version],
            ["@description", conf.description],
            ["@author", conf.author],
            ["@icon", conf.icon],
            ["@license", conf.license],
            ["@homepageURL", conf.homepageURL],
            ["@supportURL", conf.supportURL],
            ["@updateURL", conf.updateURL],
            ["@downloadURL", conf.downloadURL],
            ["@run-at", conf.runAt],
            ["@noframes", conf.noFrames]
        ] as [string, string | boolean][]) {
            // 处理 @noframes 布尔字段
            if (key === "@noframes") {
                if (val === true) {
                    baseFields.push([key, ""]);
                }
                continue;
            }
            // 过滤空值
            if (val !== undefined && val !== null && val !== "") {
                baseFields.push([key, val as string]);
            }
        }

        // 收集所有数组类型配置项（补全缺失数组）
        const arrayFields: [string, string[]][] = [
            ["@match", conf.match],
            ["@include", conf.include],
            ["@exclude", conf.exclude],
            ["@grant", conf.grant],
            ["@connect", conf.connect],
            ["@require", conf.require],
            ["@resource", conf.resource],
            ["@antifeature", conf.antifeature]
        ];

        arrayFields.forEach(([key, arr]) => {
            if (Array.isArray(arr) && arr.length) {
                arr.forEach(item => {
                    const trimItem = item?.trim();
                    if (trimItem) {
                        baseFields.push([key, trimItem]);
                    }
                });
            }
        });

        // 自动对齐核心逻辑
        const maxKeyLength = Math.max(...baseFields.map(([key]) => key.length));
        baseFields.forEach(([key, val]) => {
            const alignedKey = key.padEnd(maxKeyLength, ' ');
            lines.push(`// ${alignedKey} ${val}`.trimEnd());
        });

        lines.push("// ==/UserScript==");
        return lines.join("\n");
    },
    /**
     * 读取油猴配置
     * @param filePath 油猴油猴配置w文件路径
     * @returns 返回生产和开发模式下的油猴配置
     */
    readTamperMonkey(filePath: string): TamperMonkeyResult {
        const fileContent = fs.readFileSync(filePath, {encoding: 'utf-8'});
        const jsonData = JSON.parse(fileContent);
        const newData: Record<string, unknown> = {}
        for (const key in jsonData) {
            if (!key.startsWith('@')) continue
            const newKey = key.substring(1);
            let newItem: string[] = jsonData[key]
            if (newKey === 'match') {
                newItem = newItem.filter(item => {
                    if (item.includes('localhost')) {
                        return false
                    }
                    return true
                })
            }
            newData[newKey] = newItem
        }
        return {notDevData: newData, devData: jsonData}
    }

}
