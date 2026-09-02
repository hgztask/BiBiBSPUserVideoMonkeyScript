import path from "path";
import fs from "fs";

/**
 * 自定义模块解析插件：处理 `@/` 路径别名与 .ts/.vue/.json 扩展名补全
 * 被 rollup.config.mjs（主构建）与 server/wsServer.ts（WebSocket 测试构建）共用
 */
export default function tsResolve() {
    return {
        name: 'ts-resolve',
        resolveId(source: string, importer: string) {
            // 处理 @/ 路径别名
            if (source.startsWith('@/')) {
                const resolved = path.resolve(process.cwd(), 'src/web', source.slice(2));
                if (fs.existsSync(resolved)) return resolved;
                const withTs = resolved + '.ts';
                if (fs.existsSync(withTs)) return withTs;
                const withVue = resolved + '.vue';
                if (fs.existsSync(withVue)) return withVue;
                return null;
            }

            // 只处理相对路径的导入
            if (!source.startsWith('.') || !importer) return null;

            // 清理 importer 路径（移除 query string 如 ?rollup-plugin-vue=script.ts）
            const cleanImporter = importer.split('?')[0];
            // 确保使用绝对路径
            const absImporter = path.isAbsolute(cleanImporter) ? cleanImporter : path.resolve(cleanImporter);
            const importerDir = path.dirname(absImporter);
            let resolved = path.resolve(importerDir, source);

            // Windows 路径规范化
            resolved = path.normalize(resolved);

            // 如果文件已存在（带完整扩展名），直接返回
            if (fs.existsSync(resolved)) return resolved;

            // 尝试添加 .ts 扩展名
            const withTs = resolved + '.ts';
            if (fs.existsSync(withTs)) return withTs;

            // 尝试添加 .vue 扩展名
            const withVue = resolved + '.vue';
            if (fs.existsSync(withVue)) return withVue;

            // 尝试添加 .json 扩展名
            const withJson = resolved + '.json';
            if (fs.existsSync(withJson)) return withJson;

            return null;
        }
    };
}
