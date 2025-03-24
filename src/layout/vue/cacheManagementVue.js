import bvDexie from "../../model/bvDexie.js";
import defUtil from "../../utils/defUtil.js";
import {eventEmitter} from "../../model/EventEmitter.js";

export const cache_management_vue = {
    template: `
      <div>
        <el-card>
          <template #header>说明</template>
          <div>1.每个域名中的缓存数据不同</div>
          <div>2.仅仅支持导入json格式</div>
          <div>3.下面导入默认追加模式</div>
          <div>4.当前域名
            <el-tag>{{ hostname }}</el-tag>
          </div>
        </el-card>
        <el-card>
          <template #header>操作</template>
          <el-button @click="inputFIleBut">追加导入视频缓存数据</el-button>
          <input ref="inputDemo" type="file" @change="handleFileUpload" accept="application/json"
                 style="display: none">
          <el-button @click="clearPageVideoCacheDataBut">清空当前域名的视频缓存数据</el-button>
          <el-button @click="lookContentBut">查看内容</el-button>
          <el-button @click="lookContentLenBut">查看数据量</el-button>
          <el-button type="warning" @click="batchDelBut">批量删除</el-button>
        </el-card>
        <el-card>
          <template #header>导出</template>
          <el-button @click="outDbDataBut">导出至文件</el-button>
          <el-button @click="outToConsoleBut">导出至控制台</el-button>
        </el-card>
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
        },
        lookContentBut() {
            this.$confirm('当数据量过大时，可能卡顿，等待时间会较为长，是要继续吗').then(async () => {
                const loading = this.$loading({text: "获取中..."});
                const r = await bvDexie.getVideoInfo()
                loading.close()
                eventEmitter.send('展示内容对话框', JSON.stringify(r))
                this.$message('获取成功')
            })
        },
        outToConsoleBut() {
            bvDexie.getVideoInfo().then(r => {
                this.$alert('已导出至控制台上，可通过f12等方式查看')
                const hostname = this.hostname
                console.log(`${hostname}的视频数据===start`)
                console.log(r)
                console.log(`${hostname}的视频数据=====end`)
            })
        },
        lookContentLenBut() {
            bvDexie.getVideoInfoCount().then((len) => {
                this.$alert(`数据量${len}`)
            })
        },
        batchDelBut() {
            this.$prompt('请输入删除的bv号，多个bv号用逗号隔开', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(async ({value}) => {
                value = value?.trim() || null || ""
                if (value === null) return;
                const bvs = value.split(',');
                if (bvs.length === 1) {
                    const bool = await bvDexie.delVideoInfoItem(bvs[0])
                    if (bool) {
                        this.$message.success(`删除${value}的视频缓存数据成功`)
                    } else {
                        this.$message.warning(`删除失败，未找到${value}的视频缓存数据`)
                    }
                    return
                }
                const data = await bvDexie.bulkDelVideoInfoItem(bvs);
                if (data.state) {
                    if (data.success.length === bvs.length) {
                        this.$alert(`删除${data.success.join(',')}的视频缓存数据成功`, {
                            type: 'success'
                        })
                    } else {
                        this.$alert(`删除${data.success.join(',')}的视频缓存数据成功，${data.fail.join(',')}的视频缓存数据未找到`, {
                            type: 'warning'
                        })
                    }
                } else {
                    this.$message.warning(`删除失败,错误信息请看控制台`)
                }
            })
        }
    },
    created() {
    }
};
