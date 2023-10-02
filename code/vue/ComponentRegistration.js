//定义自定义组件

Vue.component("liveRoomItem", {//用于显示直播列表中默认的项目，无封面信息
    props: ["upAddress", "face", "roomId", "title", "upName"],
    template: `
        <div style="display: flex;flex-direction: row;height: 64px;align-items: center;border: 1px solid aqua">
        <div style="width: 48px;height: 48px;border-radius: 50%;overflow: hidden;margin-right:15px;">
            <a :href="upAddress" target="_blank">
                <img v-bind:src="face" style="width: 100%; height: 100%;object-fit: inherit">
            </a>
        </div>
        <div style="display: flex;flex-direction: column;justify-content: space-around;">
            <a :href="roomId" target="_blank">
                <div :title="title" style="font-size: 17px;font-weight: bold">{{ title }}</div>
            </a>
            <a>
                <div :title="upName">{{ upName }}</div>
            </a>
        </div>
        </div>`,
})


//TODO 封面显示效果还需优化，以及视频帧等
Vue.component("liveRoomFrontCoverItem", {
    props: ["upAddress", "face", "roomId", "title", "upName", "frontCover"],
    template: `
        <div style="border: 1px solid aqua;display: flex;align-items: center;flex-direction: column;">
        <div style="height: 144px;width: 256px;"><img :src="frontCover" alt="" style="height: 100%"></div>
        <div style="display: flex;flex-direction: row;height: 64px;align-items: center;">
            <div style="width: 48px;height: 48px;border-radius: 50%;overflow: hidden;margin-right:15px;">
                <a :href="upAddress" target="_blank">
                    <img v-bind:src="face" style="width: 100%; height: 100%;object-fit: inherit">
                </a>
            </div>
            <div style="display: flex;flex-direction: column;justify-content: space-around;">
                <a :href="roomId" target="_blank">
                    <div :title="title" style="font-size: 17px;font-weight: bold">{{ title }}</div>
                </a>
                <a>
                    <div :title="upName">{{ upName }}</div>
                </a>
            </div>
        </div>
        </div>`,
});