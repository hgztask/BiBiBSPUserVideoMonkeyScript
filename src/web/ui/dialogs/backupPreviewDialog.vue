<script setup lang="ts">
import {computed, ref} from 'vue';
import {ElMessage} from 'element-plus';
import {eventEmitter} from '@/core/EventEmitter.ts';
import backupMerge, {type ApplyMode, type RuleDiffResult} from '@/core/backup/backupMerge.ts';
import type {RuleMap} from '@/core/backup/backupKeys.ts';

/** 备份导入预览对话框：展示本地与导入内容的差异，由用户选择覆盖或合并 */
interface BackupPreviewPayload {
  title?: string;
  rules: RuleMap;
  source?: string;
  unknownKeys?: { key: string, count: number }[];
  invalidCounts?: { key: string, count: number }[];
  /** 自定义应用逻辑；不传则直接写入GM存储 */
  apply?: (mode: ApplyMode) => Promise<void> | void;
}

const dialogVisible = ref(false);
const payload = ref<BackupPreviewPayload | null>(null);
const diff = ref<RuleDiffResult | null>(null);
const applying = ref(false);

const title = computed(() => payload.value?.title ?? '备份导入预览');
const unknownSummary = computed(() => (payload.value?.unknownKeys ?? []).filter(item => item.count > 0));
const invalidSummary = computed(() => (payload.value?.invalidCounts ?? []).filter(item => item.count > 0));

const open = (data: BackupPreviewPayload) => {
  payload.value = data;
  diff.value = backupMerge.diffRuleMap(backupMerge.getLocalRuleMap(), data.rules);
  dialogVisible.value = true;
};

const apply = async (mode: ApplyMode) => {
  const data = payload.value;
  if (!data || applying.value) return;
  applying.value = true;
  try {
    if (data.apply) {
      await data.apply(mode);
    } else {
      backupMerge.applyRuleMap(data.rules, mode);
    }
    ElMessage.success(mode === 'overwrite' ? '已覆盖导入' : '已合并导入');
    eventEmitter.send('刷新规则信息', false);
    dialogVisible.value = false;
  } catch (e: any) {
    ElMessage.error(e?.message ?? '导入失败');
  } finally {
    applying.value = false;
  }
};

const closedHandle = () => {
  payload.value = null;
  diff.value = null;
  applying.value = false;
};

eventEmitter.on('备份导入预览对话框', open);
</script>

<template>
  <el-dialog v-model="dialogVisible" :close-on-click-modal="false" :title="title" width="720px" @closed="closedHandle">
    <div v-if="diff">
      <div style="margin-bottom: 8px;">
        <el-tag v-if="payload?.source" type="info">{{ payload.source }}</el-tag>
        <el-tag style="margin-left: 6px;" type="warning">合并新增 {{ diff.totalOnlyIncoming }} 条</el-tag>
        <el-tag style="margin-left: 6px;" type="danger">覆盖将删除 {{ diff.totalOnlyLocal }} 条</el-tag>
        <el-tag v-if="diff.emptyIncomingKeys.length > 0" style="margin-left: 6px;" type="info">
          文件中 {{ diff.emptyIncomingKeys.length }} 个类型为空，覆盖导入会清空
        </el-tag>
      </div>
      <el-alert v-if="unknownSummary.length > 0" :closable="false" style="margin-bottom: 8px;" type="warning">
        <template #title>
          已忽略 {{ unknownSummary.length }} 个未知规则类型：
          {{ unknownSummary.map(item => `${item.key}(${item.count})`).join('、') }}
        </template>
      </el-alert>
      <el-alert v-if="invalidSummary.length > 0" :closable="false" style="margin-bottom: 8px;" type="error">
        <template #title>
          以下类型存在无效内容（已丢弃）：
          {{ invalidSummary.map(item => `${item.key}(${item.count})`).join('、') }}
        </template>
      </el-alert>
      <el-table :data="diff.rows" border max-height="420" size="small">
        <el-table-column label="规则类型" prop="name" min-width="200"/>
        <el-table-column label="本地" prop="localCount" width="80"/>
        <el-table-column label="文件" prop="incomingCount" width="80"/>
        <el-table-column label="仅本地" prop="onlyLocalCount" width="90"/>
        <el-table-column label="仅文件" prop="onlyIncomingCount" width="90"/>
      </el-table>
      <div v-if="diff.rows.length === 0" style="margin-top: 8px;">本地与文件内容一致，没有可导入的内容。</div>
    </div>
    <template #footer>
      <el-button :disabled="applying" @click="dialogVisible = false">取消</el-button>
      <el-button :disabled="applying" type="danger" @click="apply('overwrite')">覆盖导入</el-button>
      <el-button :disabled="applying" type="primary" @click="apply('merge')">合并导入</el-button>
    </template>
  </el-dialog>
</template>
