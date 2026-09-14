/**
 * Element Plus 全局桥接模块
 * 将 eventEmitter 上的 el-* 事件桥接到 ElMessage/ElNotification/ElMessageBox，
 * 取代 Vue2 时代依赖组件实例 ($message/$notify/$alert/$confirm/$prompt) 的写法。
 * 由 ui/init.ts 在应用启动时安装一次，业务层继续通过 eventEmitter 调用。
 */
import {eventEmitter} from "../core/EventEmitter.ts";
import {ElMessage, ElNotification, ElMessageBox} from "element-plus";

export function installElBridge(): void {
    eventEmitter.on('el-notify', (options: any) => {
        if (!options['position']) {
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
