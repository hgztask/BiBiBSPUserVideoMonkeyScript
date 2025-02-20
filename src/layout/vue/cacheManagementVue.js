import bvDexie from "../../model/bvDexie.js";
import defUtil from "../../utils/defUtil.js";

export const cache_management_vue = {
    template: `
      <div>
      <ol>
        <li>每个域名中的缓存数据不同</li>
        <li>仅仅支持导入json格式</li>
        <li>下面导入默认追加模式</li>
      </ol>
      <div>当前域名：{{ hostname }}</div>
        <el-button @click="outDbDataBut">导出当前域名的缓存数据</el-button>
      <input ref="inputDemo" type="file" @change="handleFileUpload" accept="application/json"
             style="display: none">
        <el-button @click="inputFIleBut">追加导入视频缓存数据</el-button>
        <el-button @click="clearPageVideoCacheDataBut">清空当前域名的视频缓存数据</el-button>
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
                    this.$message('当前域名下没有缓存视频数据')
                    return
                }
                data = {
                    hostName: this.hostname,
                    size: data.length,
                    data: data
                }
                defUtil.fileDownload(JSON.stringify(data, null, 4), 'mk-db-videoInfos-cache.json')
                this.$message('已导出当前域名的缓存数据')
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
                    this.$message('文件内容有误')
                    return;
                }
                const {hostName = null, videoInfos = []} = parse;
                if (!hostName) {
                    this.$message('hostName字段不存在')
                    return;
                }
                if (!defUtil.isIterable(videoInfos)) {
                    this.$message('文件内容有误，非可迭代的数组！')
                    return;
                }
                if (videoInfos.length === 0) {
                    this.$message('tags数据为空')
                    return;
                }
                for (let item of videoInfos) {
                    if (!item['bv']) {
                        this.$message('bv字段不存在')
                        return;
                    }
                    if (!item['tags']) {
                        this.$message('tags字段不存在')
                        return;
                    }
                    if (!item['userInfo']) {
                        this.$message('userInfo字段不存在')
                        return;
                    }
                    if (!item['videoInfo']) {
                        this.$message('videoInfo字段不存在')
                        return;
                    }
                }
                bvDexie.bulkImportVideoInfos(videoInfos).then((bool) => {
                    if (bool) {
                        this.$message('导入成功')
                    } else {
                        this.$message('导入失败')
                    }
                })
            })
        },
        inputFIleBut() {
            this.$refs.inputDemo.click();
        },
        clearPageVideoCacheDataBut() {
            this.$confirm('是否清空当前域名下的tags数据').then(() => {
                bvDexie.clearVideoInfosTable().then((bool) => {
                    if (bool) {
                        this.$message('已清空当前域名下的视频缓存数据')
                    } else {
                        this.$message('清空失败')
                    }
                })
            })
        }
    },
    created() {
    }
};
