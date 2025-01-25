import importContent from 'rollup-plugin-import-content'

export default [
    {
        input: 'src/main.js',
        external: ['vue', 'dexie'],
        plugins: [
            importContent({
                fileName: ['.css']
            }),
            // terser({
            //     compress: {
            //         drop_console: false, // 不删除 console.log 语句
            //         drop_debugger: false // 不删除 debugger 语句
            //     }
            // })
        ],
        output: {
            file: 'dist/local_build.js',
            format: 'iife',
            globals: {
                vue: "Vue", // 这里指定 'vue' 模块对应的全局变量名为 'Vue'
                dexie: 'Dexie'
            }
        }
    }
];
