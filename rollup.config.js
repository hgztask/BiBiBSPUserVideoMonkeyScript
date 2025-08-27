import importContent from 'rollup-plugin-import-content'
import vue from 'rollup-plugin-vue';
import esbuild from 'rollup-plugin-esbuild';
import serve from 'rollup-plugin-serve'
import replace from '@rollup/plugin-replace'
import test_plugin from './plugin/rollup-test-plugin.js'

// 开发环境为 true，生产环境为 false，默认为开发环境
const __DEV__ = (process.env.ROLLUP_ENV || 'development') === 'development';
export default {
    // 性能监控
    perf: !__DEV__,
    input: 'src/web/main.js',
    external: ['vue', 'dexie'],
    plugins: [
        // 使用 replace 插件定义全局变量
        replace({
            __DEV__: JSON.stringify(__DEV__),
            preventAssignment: true,
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
        vue({
            css: true,
            compileTemplate: true // 编译模板
        }),
        test_plugin({
            clearComments: true
        }),
        __DEV__ ? serve({
            open: false,
            port: 3000,
            contentBase: 'dist',
        }) : {}
        /*        terser({
                    compress: {
                        drop_console: false, // 不删除 console.log 语句
                        drop_debugger: false // 不删除 debugger 语句
                    }
                })*/
    ],
    output: {
        file: 'dist/local_build.js',
        format: 'iife',
        //hidden为隐藏 source map，inline为内联 source map，separate为外部 source map
        // sourcemap: "inline",
        compact: __DEV__,// 压缩代码
        globals: {
            vue: "Vue", // 这里指定 'vue' 模块对应的全局变量名为 'Vue'
            dexie: 'Dexie'
        }
    }
};
