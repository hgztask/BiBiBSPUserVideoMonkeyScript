import importContent from 'rollup-plugin-import-content'

export default [
    {
        input: 'src/main.js',
        external: ['vue'],
        plugins: [
            importContent({
                fileName:['.css']
            })
        ],
        output: {
            file: 'dist/local_build.js',
            format: 'iife',
            globals: {
                vue: "Vue" // 这里指定 'vue' 模块对应的全局变量名为 'Vue'
            }
        }
    }
];
