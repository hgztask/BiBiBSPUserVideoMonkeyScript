import gmUtil from '../utils/gmUtil.js'
import defUtil from "../utils/defUtil.js";
import ruleUtil from '../utils/ruleUtil.js'
import localMKData from "../data/localMKData.js";
import Vue from "vue";


const returnVue = () => {
    return new Vue({
        template: `
          <div style="display: flex">
            <div style="width: 84%;" gz_bezel>
              <h4>使用说明</h4>
              <ol>
                <li>脚本中会对要匹配的内容进行去除空格和转成小写，比如有个内容是【不 要 笑 挑 战
                  ChallEnGE】，会被识别称为【不要笑挑战challenge】
                </li>
                <li>在上述一点的情况下，模糊匹配和正则匹配的方式时不用考虑要匹配的内容中大写问题</li>
                <li>大部分情况下模糊匹配比精确匹配好用</li>
                <li>如果用户要添加自己的正则匹配相关的规则时，建议先去该网址进行测试再添加，避免浪费时间
                  <a href="https://www.jyshare.com/front-end/854/" target="_blank">>>>正则表达式在线测试<<<</a>
                </li>
              </ol>
              <div>
<!--                <h3>指定类型批量添加</h3>-->
<!--                <span>指定类型批量添加，每个规则空格分割</span>-->
<!--                <textarea-->
<!--                    style="width: 100%"-->
<!--                    cols="30" rows="5" placeholder="匹配添加内容时规则内容" v-model="inputVal"/>-->
              </div>
              <div>
                <label>
                  <input type="checkbox" v-model="bOnlyTheHomepageIsBlocked">仅首页屏蔽生效屏蔽
                </label>
              </div>
              <div>
                <select v-model="selectVal">
                  <option v-for="item in ruleInfoArr" :value="item.type">{{ item.name }}</option>
                </select>
                《====可点击切换条件
              </div>
              <button gz_type @click="operationBut('add')">添加{{ selectText }}</button>
              <button gz_type @click="operationBut('del')">移除{{ selectText }}</button>
              <button gz_type @click="operationBut('set')">修改{{ selectText }}</button>
              <button gz_type="info" @click="operationBut('del_all')">全部移除</button>
              <div>
                <h2>导出规则</h2>
                <button gz_type @click="ruleOutToFIleBut">导出到文件</button>
                <button gz_type>导出到编辑框</button>
                <button gz_type @click="ruleOutToConsoleBut">导出到控制台</button>
              </div>
              <hr>
              <div>
                <h2>导入规则</h2>
                <div style="display: flex;justify-content:space-between;">
                  <ol>
                    <li>规则内容请在下面编辑框中导入</li>
                    <li>旧版本的需要使用下面的v1旧版本导入规则</li>
                    <li>旧版本的只能覆盖导入</li>
                    <li>v1之后的版本可以选择覆盖和追加</li>
                  </ol>
                  <ol>
                    <li v-for="item in ruleReference">
                      <button gz_type='info' @click="xtipAlertBut(item.content,item.title)">
                        {{ item.title }}
                      </button>
                    </li>
                  </ol>
                </div>
                <button gz_type @click="overwriteImportRulesBut">覆盖导入规则</button>
                <button gz_type @click="appendImportRulesBut">追加导入规则</button>
                <button gz_type @click="overwriteImportRulesV1But">v1旧版本覆盖导入规则</button>
                <div>
                  <textarea cols="30" rows="10" placeholder="要导入的规则内容" style="width: 100%"
                            v-model="ruleContentImport"></textarea>
                </div>
              </div>
            </div>
            <div style="width: 15%;" gz_bezel>
              <h2>规则信息</h2>
              <button gz_type @click="refreshInfoBut">刷新信息</button>
              <div v-for="item in ruleInfoArr">{{ item.name }}
                <button gz_type>{{ item.len }}</button>
                个
              </div>
            </div>
          </div>`,
        el: '#shield #rule_management_vue',
        data() {
            return {
                selectVal: 'name',
                selectText: "",
                //要导入的规则内容
                ruleContentImport: "",
                ruleActions: [
                    {
                        type: "uid",
                        name: "uid(精确)",
                    }
                ],
                //规则key列表
                ruleKeyArr: [],
                //规则信息
                ruleInfoArr: [],
                ruleReference: [
                    {
                        title: "旧版本规则参考",
                        content: ` {"用户名黑名单模式(精确匹配)":["账号已注销"],"BV号黑名单模式(精确匹配)":[],
                        "用户名黑名单模式(模糊匹配)":["bili_","_bili"],"用户uid黑名单模式(精确匹配)":[442010132,76525078,225219967,3493283164588093],
                        "用户uid白名单模式(精确匹配)":[344490740,1861980711],"标题黑名单模式(模糊匹配)":["激励计划","蚌不住","手游激励","游戏活动打卡"],
                        "标题黑名单模式(正则匹配)":["感觉.*不如","不要笑.*挑战"],"评论关键词黑名单模式(模糊匹配)":["感觉不如","差不多的了"],
                        "评论关键词黑名单模式(正则匹配)":["这不.+吗","玩.*的","不要笑.*挑战"],"粉丝牌黑名单模式(精确匹配)":[],
                        "专栏关键词内容黑名单模式(模糊匹配)":[],"动态关键词内容黑名单模式(模糊匹配)":["拼多多","京东红包","京东618红包","618活动"]}`
                    },
                    {
                        title: "新版本规则参考",
                        content: "待补充"
                    }
                ],
                //是否仅首页屏蔽生效
                bOnlyTheHomepageIsBlocked: localMKData.getBOnlyTheHomepageIsBlocked()
            }
        },
        methods: {
            operationBut(model) {
                debugger
                const type = this.selectVal;
                if (model === "add") {
                    ruleUtil.showAddRuleInput(type).then((msg) => {
                        this.refreshInfoBut();
                        alert(msg);
                    }).catch(errMsg => {
                        Qmsg.info(errMsg);
                    });
                }
                if (model === "del") {
                    ruleUtil.showDelRuleInput(type).then((msg) => {
                        this.refreshInfoBut();
                        alert(msg);
                    }).catch(errMsg => {
                        Qmsg.info(errMsg);
                    });
                }
                if (model === "set") {
                    ruleUtil.showSetRuleInput(type).then((msg) => {
                        this.refreshInfoBut();
                        alert(msg);
                    }).catch(errMsg => {
                        Qmsg.info(errMsg);
                    });
                }
                if (model === "del_all") {
                    if (!window.confirm("确定要删除所有规则吗？")) {
                        Qmsg.info('取消删除全部操作');
                        return;
                    }
                    for (let x of this.ruleKeyArr) {
                        gmUtil.delData(x);
                    }
                    alert("删除全部规则成功");
                    this.refreshInfoBut();
                }
            },
            ruleOutToFIleBut() {
                const ruleContent = ruleUtil.getRuleContent(4);
                let fileName = "b站屏蔽器规则-" + defUtil.toTimeString();
                const s = prompt("保存为", fileName);
                if (s === null) return;
                if (!(s.includes(" ") || s === "" || s.length === 0)) fileName = s;
                defUtil.fileDownload(ruleContent, fileName + ".json");
            },
            ruleOutToConsoleBut() {
                xtip.msg('已导出到控制台上！', {icon: 's'})
                console.log(ruleUtil.getRuleContent());
            },
            // 刷新规则信息
            refreshInfoBut() {
                for (let x of this.ruleInfoArr) {
                    x.len = gmUtil.getData(x.type, []).length;
                }
                Qmsg.info('已刷新规则信息');
            },
            //覆盖导入规则
            overwriteImportRulesBut() {
                const trim = this.ruleContentImport.trim();
                if (ruleUtil.overwriteImportRules(this.ruleKeyArr, trim)) {
                    xtip.msg('已导入成功！', {icon: 's'})
                    this.refreshInfoBut();
                }
            },
            //追加导入规则
            appendImportRulesBut() {
                const trim = this.ruleContentImport.trim();
                if (ruleUtil.appendImportRules(this.ruleKeyArr, trim)) {
                    xtip.msg('已导入成功！', {icon: 's'})
                    this.refreshInfoBut();
                }
            },
            //旧版本导入规则
            overwriteImportRulesV1But() {
                const trim = this.ruleContentImport.trim();
                if (ruleUtil.overwriteImportRulesV1(trim)) {
                    xtip.msg('已导入成功！', {icon: 's'})
                    this.refreshInfoBut();
                }
            },
            xtipAlertBut(content, title) {
                xtip.alert(content,
                    {title: title})
            }
        },
        watch: {
            bOnlyTheHomepageIsBlocked(newVal) {
                localMKData.setBOnlyTheHomepageIsBlocked(newVal);
            },
            selectVal(newVal) {
                console.log(newVal)
                const find = this.ruleInfoArr.find(item => item.type === newVal);
                this.selectText = find.name;
            }
        },
        created() {
            for (let newRuleKeyListElement of ruleUtil.getNewRuleKeyList()) {
                this.ruleKeyArr.push(newRuleKeyListElement.key);
                this.ruleInfoArr.push({
                    type: newRuleKeyListElement.key,
                    name: newRuleKeyListElement.name,
                    len: 0
                })
            }
            const find = this.ruleInfoArr.find(item => item.type === this.selectVal);
            this.selectText = find.name;
            this.refreshInfoBut();
        }
    });
}


export default returnVue
