/**
 * Element Plus 全局桥接模块
 * 将 eventEmitter 上的 el-* 事件桥接到 ElMessage/ElNotification/ElMessageBox，
 * 取代 Vue2 时代依赖组件实例 ($message/$notify/$alert/$confirm/$prompt) 的写法。
 * 由 ui/init.ts 在应用启动时安装一次，业务层继续通过 eventEmitter 调用。
 */
import {eventEmitter} from "../core/EventEmitter.ts";
import {ElMessage, ElNotification, ElMessageBox} from "element-plus";

export function installElBridge(): void {
    // EP 的 ElNotification 内部只初始化了 4 个标准 position（top-left/top-right/bottom-left/bottom-right），
    // 传入非标准 position 时内部 notifications[position] 为 undefined，会抛 forEach 错误。
    // 这里统一归一化：缺失或非标准值一律使用 bottom-right。
    const standardPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    eventEmitter.on('el-notify', (options: any) => {
        if (!options || typeof options !== 'object') {
            options = {message: String(options)};
        }
        if (!options.position || !standardPositions.includes(options.position)) {
            options.position = 'bottom-right';
        }
        ElNotification(options);
    })
    eventEmitter.on('el-msg', (...options: any[]) => {
        (ElMessage as any)(...options);
    })
    eventEmitter.on('el-alert', (...options: any[]) => {
        (ElMessageBox.alert as any)(...options);
    })
    eventEmitter.handler('el-confirm', (...options: any[]) => {
        return (ElMessageBox.confirm as any)(...options);
    })
    eventEmitter.handler('el-prompt', (...options: any[]) => {
        return (ElMessageBox.prompt as any)(...options);
    })
}
