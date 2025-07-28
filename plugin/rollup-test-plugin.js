//去除块注释和部分单行注释
const clearComments = (content) => {
    //定义正则表达式，匹配块注释和部分单行注释
    const commentRegex = /^\s+\/\/.*|^\/\/.*|\/\*[\s\S]*?\*\//gm
    return content.replace(commentRegex, '')
}
//清除换行
const clearLine = (content) => {
    return content.replace(/[\r\n]+/gm, '\n')
}

export default (userOptions = {}) => {
    return {
        name: 'mk-plugin',
        options(config) {
            userOptions = {
                ...{
                    clearComments: false
                }, ...userOptions
            }
        },
        // 处理每个分块
        renderChunk(code, chunk) {
            let newCode;
            // 处理换行符，每段落之间保留一个换行
            if (userOptions.clearComments) {
                //是否清除注释
                newCode = clearComments(code);
                return clearLine(newCode)
            }
            return clearLine(code)
        },
    };
}
