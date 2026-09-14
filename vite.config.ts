import {defineConfig, type Plugin} from 'vite';
import vue from '@vitejs/plugin-vue';
import {resolve} from 'path';
import {writeFileSync} from 'fs';
import mkUtil from './plugin/mkUtil';

// 生产模式默认 true；watch:dev（vite build --watch）时 NODE_ENV 未设为 production 且命令不含 build
const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('build');

// 外部库 CDN（运行时由 @require 加载到拼接作用域，见 install.user.js 的 @require 顺序）
const VUE_URL = 'https://unpkg.com/vue@3.5.13/dist/vue.global.prod.js';
const ELEMENT_PLUS_URL = 'https://unpkg.com/element-plus@2.14.5/dist/index.full.min.js';
const DEXIE_URL = 'https://unpkg.com/dexie@4.2.0/dist/dexie.min.js';

/**
 * 构建插件：
 * 1. 把 .vue 组件提取的独立 CSS chunk 内联进 JS（GM_addStyle 注入，单文件交付）
 * 2. 生产模式去除注释
 * 3. 产物 local_build.js 是无 ==UserScript== 头的库文件（由 install.user.js 通过 @require 加载）
 * 4. 构建同时生成 vue-bridge.js 与安装壳 install.user.js（demo 式 @require 加载）
 */
function tampermonkeyPlugin(): Plugin {
    return {
        name: 'tampermonkey-header',
        enforce: 'post',
        generateBundle(_, bundle) {
            // —— 1. 内联 CSS ——
            const cssChunks = Object.entries(bundle).filter(([name, item]) => name.endsWith('.css') && item.type === 'asset');
            if (cssChunks.length > 0) {
                const allCss = cssChunks.map(([, item]) => (item as any).source).join('\n');
                for (const [name] of cssChunks) {
                    delete bundle[name];
                }
                for (const fileName of Object.keys(bundle)) {
                    const chunk = bundle[fileName];
                    if (chunk.type !== 'chunk' || !chunk.isEntry) continue;
                    const inject = `/* 组件内联样式 */GM_addStyle(${JSON.stringify(allCss)});`;
                    chunk.code = inject + chunk.code;
                }
            }
            // —— 2. 处理 JS chunk（应用产物经 @require 加载，不拼接 ==UserScript== 头）——
            for (const fileName of Object.keys(bundle)) {
                const chunk = bundle[fileName];
                if (chunk.type !== 'chunk') continue;
                let code = chunk.code;
                if (isProd) {
                    // 去除块注释和单行注释
                    code = code.replace(/^\s*\/\/.*|^\/\/.*|\/\*[\s\S]*?\*\//gm, '');
                }
                // 每段落之间保留一个换行
                code = code.replace(/[\r\n]+/gm, '\n');
                chunk.code = code;
            }
        },
        closeBundle() {
            writeVueBridge();
            writeInstallShell();
        }
    };
}

/**
 * vue 全局桥接文件：Vue3 的 vue.global.prod.js 用顶层 `var Vue = ...` 声明，
 * 在油猴 @require 拼接作用域内可见但不会成为 window 全局；这里显式挂到 window，
 * 供 Element Plus 这类依赖 globalThis.Vue 的库使用。
 */
function writeVueBridge(): void {
    const content = '// Vue 全局桥接：把 @require 拼接作用域内的顶层 var Vue 显式挂到 window，供 Element Plus 使用\n' +
        'if (typeof Vue !== "undefined" && !window.Vue) { window.Vue = Vue; }\n';
    writeFileSync(resolve(__dirname, 'dist/vue-bridge.js'), content, 'utf-8');
}

/**
 * 生成安装壳脚本：头部元信息 + 按顺序 @require（vue → 桥 → EP → dexie → 应用产物）。
 * 所有 @require 在油猴中拼接为同一作用域执行，故应用产物（裸 Vue/ElementPlus/Dexie）能取到各库。
 * vue-bridge.js 与 local_build.js 以 file:// 绝对路径引用（本地调试需允许访问文件 URL，与 demo 一致）。
 */
function writeInstallShell(): void {
    const dist = resolve(__dirname, 'dist');
    const meta = mkUtil.readTamperMonkey(resolve(__dirname, 'tamper_monkey.json')).notDevData;
    const installMeta = {...meta};
    delete installMeta.resource;
    installMeta.require = [
        VUE_URL,
        `file://${dist}\\vue-bridge.js`,
        ELEMENT_PLUS_URL,
        DEXIE_URL,
        `file://${dist}\\local_build.js`,
    ];
    const shell = mkUtil.generateTamperMeta(installMeta as any);
    writeFileSync(resolve(__dirname, 'dist/install.user.js'), shell + '\n', 'utf-8');
}

export default defineConfig({
    plugins: [
        vue(),
        tampermonkeyPlugin(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src/web'),
        },
    },
    define: {
        __DEV__: JSON.stringify(!isProd),
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/web/main.ts'),
            formats: ['iife'],
            name: 'BIBIShield',
            fileName: () => 'local_build.js',
        },
        rollupOptions: {
            // vue/element-plus/dexie 全部由 @require 加载（demo 式拼接作用域），不打包
            external: ['vue', 'element-plus', 'dexie'],
            output: {
                // 裸全局名：应用作为 @require 与这些库同作用域，直接引用变量名即可
                globals: {
                    vue: 'Vue',
                    'element-plus': 'ElementPlus',
                    dexie: 'Dexie',
                },
                sourcemap: false,
            },
        },
        // 生产压缩；dev（watch:dev）保留可读代码便于调试
        minify: isProd ? 'esbuild' : false,
        chunkSizeWarningLimit: 3000,
        outDir: 'dist',
        emptyOutDir: true,
    },
});