Vue.component("main_layout", {
    template: `
      <div>
      <ul style="display: flex;justify-content: space-around;padding-top: 10px;" id="tabUl">
        <li v-for="(v) in tabList" :key=v.id>
          <button :value="v.id">{{ v.label }}</button>
        </li>
      </ul>
      <div>
        <div v-for="v in tabList" :key=v.id v-bind:id="v.id" :class="{tab:true}"></div>
      </div>
      <hr>
      <footer_layout/>
      </div>`,
    data() {
        return {
            tabList: [
                {id: "panelSetsTheLayout", label: "面板设置"},
                {id: "ruleCRUDLayout", label: "规则增删改查-信息-备份与恢复(导出与导入)"},
                {id: "homePageLayout", label: "首页"},
                {id: "video_params_layout", label: "视频参数"},
                {id: "liveLayout", label: "直播列表"},
                {id: "lookAtItLaterListLayout", label: "稍后再看列表"},
                {id: "outputInfoLayout", label: "输出信息"},
                {id: "otherLayout", label: "其他"},
                {id: "donateLayout", label: "支持打赏作者"},
                {id: "ruleCenterLayout", label: "规则中心"},
                {id: "accountCenterLayout", label: "账户中心"}

            ]
        }
    }
});

const MainVue = {
    addVue() {
        window.mainVue = new Vue({
            el: "#home_layout",
            data: {
                show: false
            }
        });
    }
}