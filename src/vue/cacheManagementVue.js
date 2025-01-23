import Vue from "vue";
import bvDexie from "../model/bvDexie.js";
import defUtil from "../utils/defUtil.js";

const returnVue = () => {
    return new Vue({
        el: "#cache_management_vue",
        template: `
          <div>
          <ol>
            <li>每个域名中的缓存数据不同</li>
            <li>仅仅支持导入json格式</li>
            <li>下面导入默认追加模式</li>
          </ol>
          <div>当前域名：{{ hostname }}</div>
          <button gz_type @click="outDbDataBut">导出当前域名的缓存数据</button>
          <input ref="inputDemo" type="file" @change="handleFileUpload" accept="application/json"
                 style="display: none">
          <button @click="inputFIleBut" gz_type>追加导入视频缓存数据</button>
          <button gz_type @click="clearPageVideoCacheDataBut">清空当前域名的视频缓存数据</button>
          </div>`,
        data() {
            return {
                hostname: window.location.hostname
            }
        },
        methods: {
            outDbDataBut() {
                bvDexie.getVideoInfo().then((data) => {
                    if (data.length === 0) {
                        xtip.msg('当前域名下没有缓存视频数据')
                        return
                    }
                    data = {
                        hostName: this.hostname,
                        size: data.length,
                        data: data
                    }
                    defUtil.fileDownload(JSON.stringify(data, null, 4), 'mk-db-videoInfos-cache.json')
                    xtip.msg('已导出当前域名的缓存数据', 'success')
                    console.log(data)
                })
            },
            handleFileUpload(event) {
                defUtil.handleFileReader(event).then(data => {
                    const {content} = data;
                    /**
                     // * @type {{hostName:string,tags:[{bv:string,name:string,title:string,tags:[string]}]}}
                     */
                    let parse
                    try {
                        parse = JSON.parse(content);
                    } catch (e) {
                        xtip.msg('文件内容有误', {icon: 'e'})
                        return;
                    }
                    const {hostName = null, videoInfos = []} = parse;
                    if (!hostName) {
                        xtip.msg('hostName字段不存在', {icon: 'e'})
                        return;
                    }
                    if (!defUtil.isIterable(videoInfos)) {
                        xtip.msg('文件内容有误，非可迭代的数组！', {icon: 'e'})
                        return;
                    }
                    if (videoInfos.length === 0) {
                        xtip.msg('tags数据为空', {icon: 'e'})
                        return;
                    }
                    for (let item of videoInfos) {
                        if (!item['bv']) {
                            xtip.msg('bv字段不存在', {icon: 'e'})
                            return;
                        }
                        if (!item['tags']) {
                            xtip.msg('tags字段不存在', {icon: 'e'})
                            return;
                        }
                        if (!item['userInfo']) {
                            xtip.msg('userInfo字段不存在', {icon: 'e'})
                            return;
                        }
                        if (!item['videoInfo']) {
                            xtip.msg('videoInfo字段不存在', {icon: 'e'})
                            return;
                        }
                    }
                    bvDexie.bulkImportVideoInfos(videoInfos).then((bool) => {
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
            clearPageVideoCacheDataBut() {
                xtip.confirm('是否清空当前域名下的tags数据', {
                    icon: 'a',
                    btn1: () => {
                        bvDexie.clearVideoInfosTable().then((bool) => {
                            if (bool) {
                                xtip.msg('已清空当前域名下的视频缓存数据', 'success')
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
