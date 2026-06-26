import type {Plugin} from 'rollup';
import mkUtil from './mkUtil.ts';

interface PluginOptions {
    isDev?: boolean;
    clearComments?: boolean;
}

// 去除块注释和部分单行注释
const clearComments = (content: string): string => {
    // 定义正则表达式，匹配块注释和部分单行注释
    const commentRegex = /^\s+\/\/.*|^\/\/.*|\/\*[\s\S]*?\*\//gm;
    return content.replace(commentRegex, '');
};

// 清除换行
const clearLine = (content: string): string => {
    return content.replace(/[\r\n]+/gm, '\n');
};

function getBanner(): string | null {
    const readTamperMonkey = mkUtil.readTamperMonkey('tamper_monkey.json');
    return mkUtil.generateTamperMeta(readTamperMonkey.notDevData);
}

export default (userOptions: PluginOptions = {}): Plugin => {
    return {
        name: 'mk-plugin',
        options(config) {
            userOptions = {
                clearComments: false,
                ...userOptions,
            };
        },
        transform(code, id) {
            if (userOptions.isDev) {
                return null;
            }
            if (id.endsWith('dev.js')) {
                return {code: ''};
            }
            return null;
        },
        // 处理每个分块
        renderChunk(code, chunk) {
            let newCode: string;
            // 处理换行符，每段落之间保留一个换行
            if (userOptions.clearComments) {
                // 是否清除注释
                newCode = clearComments(code);
            } else {
                newCode = code;
            }
            newCode = clearLine(newCode);
            if (userOptions.isDev) {
                return newCode;
            }
            const banner = getBanner();
            if (banner === null) {
                return newCode;
            }
            return `${banner}
            ${newCode}`;
        },
    };
};
