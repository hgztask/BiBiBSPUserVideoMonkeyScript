<script lang="ts">
import {defineComponent} from 'vue';
import {eventEmitter} from "../../../core/EventEmitter.ts";
import defUtil from "../../../core/util/defUtil.ts";
import localMKData from "../../../state/localMKData.ts";

const outputInformationFontColor = localMKData.getOutputInformationFontColor();
const highlightInformationColor = localMKData.getHighlightInformationColor();

type OutputInfo = {
  type: string;
  content: string;
  time?: string;
  count?: number;
  id?: string;
};

const typeOptions = [
  {value: 'all', label: '全部日志'},
  {value: 'info', label: '普通信息'},
  {value: 'shield-video-info', label: '视频屏蔽'},
  {value: 'shield-comment-info', label: '评论屏蔽'},
  {value: 'update-out-info', label: '状态更新'},
  {value: 'error', label: '错误信息'},
];

export default defineComponent({
  data() {
    return {
      outputInfoArr: [] as OutputInfo[],
      selectedType: 'all',
      searchKeyword: '',
      typeOptions,
    }
  },
  computed: {
    filteredInfoArr(): OutputInfo[] {
      const keyword = this.searchKeyword.trim().toLowerCase();
      return this.outputInfoArr.filter((item) => {
        if (this.selectedType !== 'all' && item.type !== this.selectedType) return false;
        if (!keyword) return true;
        return this.getPlainContent(item.content).toLowerCase().includes(keyword);
      });
    },
    emptyText(): string {
      if (this.outputInfoArr.length === 0) return '暂无输出信息';
      return '没有符合条件的输出信息';
    },
  },
  methods: {
    getPlainContent(content: string): string {
      return String(content || '').replace(/<[^>]*>/g, ' ');
    },
    getTypeLabel(type: string): string {
      const option = typeOptions.find(item => item.value === type);
      return option?.label || '其他信息';
    },
    getTypeTag(type: string): string {
      if (type === 'error') return 'danger';
      if (type === 'shield-video-info' || type === 'shield-comment-info') return 'warning';
      if (type === 'update-out-info') return 'success';
      if (type === 'info') return 'primary';
      return 'info';
    },
    clearInfoBut() {
      this.$confirm('是否清空全部输出信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.outputInfoArr = [];
        this.$notify({
          title: '输出信息',
          message: '清空成功',
          type: 'success',
          position: 'bottom-right'
        })
      }).catch(() => undefined)
    },
    updateOutInfo(infoData: OutputInfo, index: number) {
      const outPutInfoData = this.outputInfoArr[index];
      outPutInfoData.count = (outPutInfoData.count || 0) + 1;
      outPutInfoData.time = defUtil.toTimeString();
      outPutInfoData.content = infoData.content;
      this.outputInfoArr.splice(index, 1);
      this.outputInfoArr.unshift(outPutInfoData);
    },
    addOutInfo(infoData: OutputInfo) {
      infoData.content = String(infoData.content ?? '');
      const findIdIndex = this.outputInfoArr.findIndex(item => {
        if (infoData.id === undefined || item.id === undefined) return false;
        return item.id === infoData.id;
      });
      if (findIdIndex !== -1) {
        this.updateOutInfo(infoData, findIdIndex);
        return;
      }
      const findContentIndex = this.outputInfoArr.findIndex(item => item.content === infoData.content);
      if (findContentIndex !== -1) {
        this.updateOutInfo(infoData, findContentIndex);
        return;
      }
      infoData.time = defUtil.toTimeString();
      infoData.count = 1;
      this.outputInfoArr.unshift(infoData);
    },
  },
  created() {
    eventEmitter.on('打印信息', (content) => {
      this.addOutInfo({type: 'info', content: String(content ?? '')})
    })
    eventEmitter.on('event-update-out-info', (data) => {
      this.addOutInfo({
        type: 'update-out-info',
        id: data.id,
        content: String(data.msg ?? '')
      })
    })
    eventEmitter.on('event-打印屏蔽视频信息', (type, matching, videoData) => {
      const {name, uid, title, videoUrl} = videoData;
      const info = `<b style="color: ${outputInformationFontColor}; ">
根据${type}-${matching ? `<b style="color: ${highlightInformationColor}">【${matching}】</b>` : ""}-屏蔽用户【${name}】uid=
            <a href="https://space.bilibili.com/${uid}"
            style="color: ${highlightInformationColor}"
            target="_blank">【${uid}】</a>
            标题【<a href="${videoUrl}" target="_blank" style="color: ${highlightInformationColor}">${title}</a>】
            </b>`
      this.addOutInfo({
        type: 'shield-video-info',
        content: info
      })
    })

    eventEmitter.on('屏蔽评论信息', (type, matching, commentData, source) => {
      const {name, uid, content} = commentData;
      const sourceLabel = source === '响应层过滤'
        ? `<span style="color: ${highlightInformationColor}">【响应层过滤】</span>`
        : '';
      this.addOutInfo({
        type: 'shield-comment-info',
        content: `<b style="color: ${outputInformationFontColor};">
	${sourceLabel}根据${type}-${matching ? `<b style="color: ${highlightInformationColor}">【${matching}】</b>` : ""}-屏蔽用户【${name}】uid=
            <a href="https://space.bilibili.com/${uid}"
            style="color: ${highlightInformationColor}"
            target="_blank">【${uid}】</a>
            评论【${content}】
            </b>`
      })
    })

    eventEmitter.on('正则匹配时异常', (errorData) => {
      const {msg, e} = errorData
      this.addOutInfo({
        type: 'error',
        content: msg
      })
      console.error(msg)
      throw new Error(e)
    })
  }
})
</script>

<template>
  <section class="output-information-view">
    <div class="output-toolbar">
      <div class="output-toolbar__title">
        <span class="output-title">输出信息</span>
        <span class="output-subtitle">记录屏蔽动作与运行状态</span>
      </div>
      <div class="output-summary">
        <el-tag size="mini" effect="plain">累计 {{ outputInfoArr.length }}</el-tag>
        <el-tag size="mini" type="primary" effect="plain">显示 {{ filteredInfoArr.length }}</el-tag>
        <el-button type="danger" size="mini" plain icon="el-icon-delete" @click="clearInfoBut">清空</el-button>
      </div>
    </div>

    <div class="output-filter-bar">
      <el-select v-model="selectedType" size="small" class="output-filter-type" placeholder="筛选类型">
        <el-option
          v-for="option in typeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"/>
      </el-select>
      <el-input
        v-model="searchKeyword"
        class="output-filter-search"
        size="small"
        clearable
        prefix-icon="el-icon-search"
        placeholder="搜索日志内容、标题或用户名"/>
      <span class="output-filter-hint" v-if="selectedType !== 'all' || searchKeyword">已启用筛选</span>
    </div>

    <div class="output-list" role="log" aria-live="polite">
      <div v-if="filteredInfoArr.length === 0" class="output-empty">
        <i class="el-icon-document"/>
        <strong>{{ emptyText }}</strong>
        <span v-if="outputInfoArr.length > 0">请调整筛选条件后重试</span>
        <span v-else>触发屏蔽或运行操作后，相关信息会显示在这里</span>
      </div>
      <article
        v-for="(info, index) in filteredInfoArr"
        :key="`${info.id || info.type}-${info.content}-${index}`"
        class="output-item"
        :class="`output-item--${info.type}`">
        <div class="output-item__accent"/>
        <div class="output-item__main">
          <div class="output-item__head">
            <el-tag :type="getTypeTag(info.type)" size="mini" effect="light">
              {{ getTypeLabel(info.type) }}
            </el-tag>
            <span class="output-item__position">#{{ filteredInfoArr.length - index }}</span>
          </div>
          <div class="output-item__content" v-html="info.content"></div>
        </div>
        <div class="output-item__meta">
          <span class="output-item__time">{{ info.time }}</span>
          <el-tag v-if="(info.count || 0) > 1" class="output-item__count" type="info" size="mini" effect="dark">
            ×{{ info.count }}
          </el-tag>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.output-information-view {
  --output-border: #e6eaf0;
  --output-muted: #8a94a6;
  --output-text: #25324a;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 360px;
  height: calc(100vh - 88px);
  padding: 14px 16px 16px;
  background: #f5f7fa;
}

.output-toolbar,
.output-filter-bar {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--output-border);
  border-radius: 8px;
  background: #ffffff;
}

.output-toolbar__title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.output-title {
  color: var(--output-text);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .2px;
}

.output-subtitle {
  overflow: hidden;
  color: var(--output-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.output-summary {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}

.output-filter-bar {
  justify-content: flex-start;
  padding: 9px 10px;
}

.output-filter-type {
  flex: none;
  width: 128px;
}

.output-filter-search {
  flex: 1;
  min-width: 180px;
  max-width: 520px;
}

.output-filter-hint {
  flex: none;
  color: #409eff;
  font-size: 12px;
}

.output-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 2px 4px 12px 2px;
  scrollbar-color: #cbd3df transparent;
  scrollbar-width: thin;
}

.output-list::-webkit-scrollbar {
  width: 6px;
}

.output-list::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: #cbd3df;
}

.output-item {
  position: relative;
  display: flex;
  gap: 12px;
  box-sizing: border-box;
  min-height: 72px;
  margin-bottom: 8px;
  overflow: hidden;
  border: 1px solid var(--output-border);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(31, 45, 61, .03);
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.output-item:hover {
  border-color: #c8d7ea;
  box-shadow: 0 4px 14px rgba(31, 45, 61, .08);
  transform: translateY(-1px);
}

.output-item__accent {
  flex: none;
  width: 3px;
  background: #409eff;
}

.output-item--shield-video-info .output-item__accent,
.output-item--shield-comment-info .output-item__accent {
  background: #e6a23c;
}

.output-item--update-out-info .output-item__accent {
  background: #67c23a;
}

.output-item--error .output-item__accent {
  background: #f56c6c;
}

.output-item__main {
  flex: 1;
  min-width: 0;
  padding: 10px 0 11px;
}

.output-item__head {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 20px;
  margin-bottom: 5px;
}

.output-item__position {
  color: #b2bac8;
  font-size: 11px;
}

.output-item__content {
  color: var(--output-text);
  font-size: 13px;
  line-height: 1.65;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.output-item__content :deep(a) {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.output-item__content :deep(b) {
  font-weight: 500;
}

.output-item__meta {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
  min-width: 86px;
  padding: 12px 12px 11px 0;
}

.output-item__time {
  color: var(--output-muted);
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
}

.output-item__count {
  align-self: flex-end;
}

.output-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 240px;
  height: 100%;
  padding: 32px;
  border: 1px dashed #cfd7e3;
  border-radius: 8px;
  background: rgba(255, 255, 255, .72);
  color: var(--output-muted);
  text-align: center;
}

.output-empty i {
  margin-bottom: 12px;
  color: #b8c2d1;
  font-size: 30px;
}

.output-empty strong {
  margin-bottom: 6px;
  color: #5c687a;
  font-size: 14px;
  font-weight: 500;
}

.output-empty span {
  font-size: 12px;
}

@media (max-width: 640px) {
  .output-information-view {
    height: calc(100vh - 64px);
    padding: 10px;
  }

  .output-toolbar,
  .output-filter-bar {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .output-toolbar__title {
    width: 100%;
  }

  .output-summary {
    width: 100%;
    justify-content: flex-end;
  }

  .output-filter-type,
  .output-filter-search {
    width: 100%;
    max-width: none;
  }

  .output-item__meta {
    min-width: 68px;
    padding-right: 8px;
  }

  .output-item__time {
    white-space: normal;
    text-align: right;
  }
}
</style>
