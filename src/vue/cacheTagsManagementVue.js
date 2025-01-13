import Vue from "vue";
import bvDexie from "../model/bvDexie.js";
import defUtil from "../utils/defUtil.js";

const returnVue = () => {
    return new Vue({
        el: "#cache_tags_management_vue",
        template: `
          <div>
            <ol>
              <li>每个域名中的tags数据不同</li>
              <li>仅仅支持导入json格式</li>
              <li>下面导入默认追加模式</li>
            </ol>
            <div>当前域名：{{ hostname }}</div>
            <button gz_type @click="outTagsDataBut">导出当前域名的tags数据</button>
            <input ref="inputDemo" type="file" @change="handleFileUpload" accept="application/json"
                   style="display: none">
            <button @click="inputFIleBut" gz_type>追加导入tags数据</button>
            <button gz_type @click="clearPageTagsDataBut">清空当前域名的tags数据</button>
          </div>`,
        data() {
            return {
                hostname: window.location.hostname
            }
        },
        methods: {
            outTagsDataBut() {
                bvDexie.getVideoAllTags().then((data) => {
                    data = {
                        hostName: this.hostname,
                        size: data.length,
                        tags: data
                    }
                    defUtil.fileDownload(JSON.stringify(data,null,4), 'mk-db-tags.json')
                    xtip.msg('已导出当前域名的tags缓存数据', 'success')
                    console.log(data)
                })
            },
            handleFileUpload(event) {
                defUtil.handleFileReader(event).then(data => {
                    const {content} = data;
                    /**
                     * @type {{hostName:string,tags:[{bv:string,name:string,title:string,tags:[string]}]}}
                     */
                    let parse
                    try {
                        parse = JSON.parse(content);
                    } catch (e) {
                        xtip.msg('文件内容有误', {icon: 'e'})
                        return;
                    }
                    const {hostName = null, tags = []} = parse;
                    if (!hostName) {
                        xtip.msg('hostName字段不存在', {icon: 'e'})
                        return;
                    }
                    if (!defUtil.isIterable(tags)) {
                        xtip.msg('文件内容有误，非可迭代的数组！', {icon: 'e'})
                        return;
                    }
                    if (tags.length === 0) {
                        xtip.msg('tags数据为空', {icon: 'e'})
                        return;
                    }
                    for (let item of tags) {
                        if (!item['name']) {
                            xtip.msg('name字段不存在', {icon: 'e'})
                            return;
                        }
                        if (!item['title']) {
                            xtip.msg('title字段不存在', {icon: 'e'})
                            return;
                        }
                        if (!item['bv']) {
                            xtip.msg('bv字段不存在', {icon: 'e'})
                            return;
                        }
                        if (!item['tags']) {
                            xtip.msg('tags字段不存在', {icon: 'e'})
                            return;
                        }
                    }
                    bvDexie.bulkImportTags(tags).then((bool) => {
                        if (bool) {
                            xtip.msg('导入成功', 'success')
                        } else {
                            xtip.msg('导入失败', 'error')
                        }
                    })
                })
            },
            inputFIleBut() {
                this.$refs.inputDemo.click();
            },
            clearPageTagsDataBut() {
                xtip.confirm('是否清空当前域名下的tags数据', {
                    icon: 'a',
                    btn1: () => {
                        bvDexie.clearTagsTable().then((bool) => {
                            if (bool) {
                                xtip.msg('已清空当前域名下的tags数据', 'success')
                            } else {
                                xtip.msg('清空失败', 'error')
                            }
                        })
                    }
                })

            }
        },
        created() {
        }
    })
}

/**
 * 缓存tags管理Vue实例
 */
export default returnVue;
