// 自定义样式和事件处理类名
import mainDrawer from "../drawer/mainDrawer.js";

const options = {
    styles: `
                /* 自定义样式 */
                .my-custom-tab-button {
                    font-size: 16px;
                }
                .my-custom-tab-content {
                    background-color: #f9f9f9;
                }
            `,
    classes: {
        tabButton: 'my-custom-tab-button',
        tabButtonActive: 'my-custom-tab-button-active',
        tabContent: 'my-custom-tab-content',
        tabContentActive: 'my-custom-tab-content-active'
    },
    backgroundColor: '#eee',
    borderColor: '#ddd',
    textColor: '#333',
    fontWeight: 'bold',
    activeBackgroundColor: '#0056b3',
    activeTextColor: '#fff',
    contentBorderColor: '#bbb',
    contentBackgroundColor: '#ffffff',
    onTabClick: (id, title, content) => {
        const tab = tabsConfig.find(item => item.title === title);
        const height = tab.height;
        mainDrawer.setHeight(height ? height : '50vh')
    },
};

const tabsConfig = [
    {
        id: 'tab01',
        title: '面板设置',
        content: '<div id="panel_settings_vue"></div>',
        height: "25vh",
    },
    {
        id: 'tab02',
        title: '规则管理',
        content: '<div id="rule_management_vue"></div>',
        height: "96vh"
    },
    {
        id: 'tab03',
        title: '其他参数过滤',
        content: `<div id="other_parameter_filter"></div>`,
        height: '60vh'
    },
    {
        id:'id04',
        title: '兼容设置',
        content: `<div id="compatible_setting"></div>`,
    },
    {
        id: 'tab05',
        title: '缓存tags管理',
        content: '<div id="cache_tags_management_vue"></div>',
    },
    {
        id: 'tab06',
        title: '输出信息',
        content: `<div id="output_information">
<button gz_type>清空消息</button>
<ol class="info">
</ol>
</div>`,
        height: "96vh"
    },
    {
        id: 'tab07',
        title: '支持打赏',
        content: '<div id="station_b_shield_donate"></div>',
        height: "80vh"
    },
    {
        id: 'tab08',
        title: '关于和问题反馈',
        content: `<div id="station_b_shield_problem_feedback"></div>`,
        height: '53vh'
    }
];
const dynamicTabsGz = new DynamicTabs_gz('#shield', tabsConfig,
    options
);
export default dynamicTabsGz
