import importContent from 'rollup-plugin-import-content'
import {terser} from "rollup-plugin-terser";

export default {
    input: 'src/web/main.js',
    external: ['vue', 'dexie'],
    plugins: [
        importContent({
            fileName: ['.css']
        }),
        terser({
            compress: {
                // 是否删除 console.log
                drop_console: false,
                // 是否删除 debugger
                drop_debugger: true
            }
        })
    ],
    output: {
        file: 'dist/local-prod-build.js',
        format: 'iife',
        globals: {
            vue: "Vue", // 这里指定 'vue' 模块对应的全局变量名为 'Vue'
            dexie: 'Dexie'
        }
    }
};
