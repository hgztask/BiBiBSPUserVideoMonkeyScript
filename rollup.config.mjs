import importContent from 'rollup-plugin-import-content';
import vue from 'rollup-plugin-vue';
import esbuild from 'rollup-plugin-esbuild';
import serve from 'rollup-plugin-serve';
import replace from '@rollup/plugin-replace';
import less from 'rollup-plugin-less';
import test_plugin from './plugin/rollup-test-plugin.ts';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import path from 'path';
import fs from 'fs';
import {execSync} from 'child_process';

// 开发环境为 true，生产环境为 false，默认为开发环境
const __DEV__ = (process.env.ROLLUP_ENV || 'development') === 'development';

// 自定义 .ts 扩展名解析插件
function tsResolve() {
    return {
        name: 'ts-resolve',
        resolveId(source, importer) {
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

export default {
    // 性能监控
    perf: !__DEV__,
    input: 'src/web/main.ts',
    external: ['vue', 'dexie'],
    plugins: [
        {
            name: 'type-check',
            buildStart() {
                // 检查 .ts 文件
                try {
                    execSync('pnpm exec tsc --noEmit', {stdio: 'inherit'});
                } catch (e) {
                    this.error('TypeScript type check failed (.ts files)');
                }
                // 检查 .vue 文件
                try {
                    execSync('node scripts/check-vue-types.mjs', {stdio: 'inherit'});
                } catch (e) {
                    this.error('TypeScript type check failed (.vue files)');
                }
            }
        },
        tsResolve(),
        less({
            include: ['**/*.less'],
        }),
        // 使用 replace 插件定义全局变量
        replace({
            __DEV__: JSON.stringify(__DEV__),
            preventAssignment: true,
        }),
        nodeResolve({
            extensions: ['.ts', '.vue', '.js', '.json', '.css', '.less'],
        }),
        vue({
            css: true,
            compileTemplate: true // 编译模板
        }),
        esbuild({
            // 核心配置
            target: 'es2020',
            charset: 'utf8', // 明确使用 UTF-8 编码
            // 生产环境优化
            minify: false,
            // none不保留注释，inline注释
            legalComments: __DEV__ ? 'inline' : 'none',
        }),
        importContent({
            fileName: ['.css']
        }),
        test_plugin({
            isDev: __DEV__,
            clearComments: !__DEV__
        }),
        __DEV__ ? serve({
            open: false,
            port: 3000,
            contentBase: 'dist',
        }) : {}
    ],
    output: {
        file: 'dist/local_build.js',
        format: 'iife',
        //hidden为隐藏 source map，inline为内联 source map，separate为外部 source map
        // sourcemap: "inline",
        compact: true,// 压缩代码
        globals: {
            vue: "Vue", // 这里指定 'vue' 模块对应的全局变量名为 'Vue'
            dexie: 'Dexie'
        }
    }
};
