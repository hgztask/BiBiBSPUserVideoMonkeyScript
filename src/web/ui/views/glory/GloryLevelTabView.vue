<script lang="ts">
import {defineComponent} from 'vue'
import {eventEmitter} from "../../../core/EventEmitter.ts";
import localMKData from "../../../state/localMKData.ts";
import GloryLevelLimitTabView from "./GloryLevelLimitTabView.vue";
import defUtil from "../../../core/util/defUtil.ts";

export default defineComponent({
  name: "GloryLevelTabView",
  components: {GloryLevelLimitTabView},
  data() {
    return {
      imgList: [] as any[],
      mappingList: [] as any[],
      selectLevel: -1
    }
  },
  methods: {
    printImgSrcListBut() {
      console.log(this.imgList)
    },
    mappingToLevelBut(src: any) {
      const tempSelectLevel = this.selectLevel;
      if (tempSelectLevel === -1) return
      if (this.mappingList[tempSelectLevel - 1].src === "") {
        this.mappingList[tempSelectLevel - 1].src = src;
      } else {
        this.$confirm(`是要覆盖${tempSelectLevel}等级的映射url吗？`).then(() => {
          this.mappingList[tempSelectLevel - 1].src = src;
        })
      }
    },
    promptMappingToLevelBut(src: any) {
      this.$prompt("输入要映射的等级", {
        title: "映射等级",
        inputPattern: /^(?:[1-9]|[1-7][0-9]|80)$/,
        inputValue: String(this.selectLevel),
      }).then(({value}: any) => {
        value = parseInt(value)
        if (!(value >= 1 && value <= 80)) {
          return this.$message.warning("请输入范围1~80的正确的等级")
        }
        this.selectLevel = value;
        this.mappingToLevelBut(src)
      })
    },
    inputMappingUrlBut(row: any) {
      const url = row.src;
      const level = row.level;
      this.$prompt(`编辑等级${level}的映射url`, {
        inputValue: url,
        title: `编辑映射url`,
        inputPattern: /^https?:\/\/.+/,
      }).then(({value}: any) => {
        if (!value.startsWith('https://')) return this.$message.warning("请输入正确的url")
        row.src = value;
      })
    },
    selectRow(row: any) {
      this.selectLevel = row.level;
    },
    saveBut() {
      GM_setValue('glory_level_mapping_list_gm', this.mappingList.filter(item => item.src))
      this.$message.success("保存成功")
    },
    refreshMappingList() {
      const listGm = localMKData.getGloryLevelMappingListGm();
      for (let i = 1; i <= 80; i++) {
        const find = listGm.find(item => item.level === i);
        if (find) {
          this.mappingList.push(find)
          continue
        }
        this.mappingList.push({level: i, src: ''})
      }
    },
    clearBut() {
      this.$confirm("是要清空所有等级的映射关系吗？").then(() => {
        this.mappingList = []
        this.$notify({title: '', message: '已清空所有等级的映射关系，需手动点击保存配置', type: 'success'})
      })
    },
    exportMapUrlBut() {
      const toRaw = defUtil.toRaw(this.mappingList.filter(item => item.src));
      console.log("导出的荣耀等级", toRaw)
      defUtil.saveTextAsFile(JSON.stringify(toRaw), '荣耀等级映射关系列表.json')
      this.$notify({title: '', message: "已导出到浏览器控制台和尝试导出文件操作", position: "bottom-right"})
    },
    importMapUrlBut() {
      this.$prompt("粘贴荣耀等级映射内容到输入框中", {
        title: "导入荣耀等级映射列表",
        inputPlaceholder: "格式为json列表",
        //json类验证
        inputPattern: /^(\{.*}|\[.*])$/
      }).then(({value}: any) => {
        /**
         * @type{{level:number,src:string}[]}
         */
        const parse = JSON.parse(value);
        try {
          for (const item of parse) {
            if (item['level'] <= 0 || item['level'] <= 80) {
              return this.$message.warning('')
            }
          }
        } catch (e) {
          console.warn(e)
          this.$message.warning('导入的内容有误！')
          return
        }
        console.log(parse)
      })
    }
  },
  computed: {
    mappingLevelCount() {
      return this.mappingList.filter(item => item.src).length
    }
  },
  created() {
    this.refreshMappingList()
    eventEmitter.on('event:更新荣耀等级图片链接列表', (dataList) => {
      for (const src of dataList) {
        if (this.imgList.includes(src)) continue
        if (this.mappingList.some(item => item.src === src)) continue
        this.imgList.push(src)
      }
    })
  }
})
</script>

<template>
  <div>
    <el-row>
      <el-col :span="8">
        <GloryLevelLimitTabView/>
      </el-col>
      <el-col :span="8">
        <el-card :body-style="{ padding: '5px' }" shadow="never">
          <template #header>
            <gz-space align-items="flex-start" direction="">
              <div>荣耀等级图标映射(修改为零时状态，长期需手动点击保存)</div>
              <div>
                <el-button type="warning" @click="clearBut">清除</el-button>
                <el-button @click="refreshMappingList">刷新</el-button>
                <el-button type="success" @click="saveBut">保存</el-button>
                <el-button title="导出到剪切板和浏览器控制台" @click="exportMapUrlBut">导出</el-button>
                <el-button @click="importMapUrlBut">导入</el-button>
              </div>
            </gz-space>
          </template>
          <el-table :data="mappingList" border height="865" highlight-current-row
                    @row-click="selectRow">
            <el-table-column label="映射url">
              <template #default="scope">
                <div style="width: 100%; height: 100%" @click="inputMappingUrlBut(scope.row)">
                  {{ scope.row.src ? scope.row.src : "空白占位符" }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="预览" width="100">
              <template #header>
                {{ mappingLevelCount }}/{{ mappingList.length }}
              </template>
              <template #default="scope">
                <el-image :src="scope.row.src" style="height: 30px"/>
              </template>
            </el-table-column>
            <el-table-column label="等级" prop="level" width="50"/>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <gz-space>
            <span>当前直播间弹幕列表显示可添加的荣耀等级图标数量:{{ imgList.length }}</span>
            <el-button @click="printImgSrcListBut">打印url列表值</el-button>
          </gz-space>
        </el-card>
        <gz-space wrap>
          <el-card v-for="src in imgList" :key="src">
            <gz-space direction="column">
              <el-image :src="src" style="height: 30px" @click="promptMappingToLevelBut(src)"/>
              <el-button v-show="selectLevel!==-1" size="mini" @click="mappingToLevelBut(src)">映射到等级{{
                  selectLevel
                }}
              </el-button>
            </gz-space>
          </el-card>
        </gz-space>
      </el-col>
    </el-row>
  </div>
</template>