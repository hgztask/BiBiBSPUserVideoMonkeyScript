<script setup lang="ts">
import {computed, h, ref, watch} from 'vue';
import ruleUtil, {
  type MultiTypeAddResult,
  type MultiTypeDelResult
} from '@/core/util/ruleUtil.ts';
import ruleKeyListData, {type MultiTypeOption} from '@/config/ruleKeyListData.ts';
import {eventEmitter} from '@/core/EventEmitter.ts';
import {ElMessage, ElMessageBox} from 'element-plus';
import {getRememberedTypes, rememberTypes} from '@/core/util/multiTypeRuleMemory.ts';

interface RuleInfo {
  type: string;
  name: string;
  mode: string;
}

const props = withDefaults(defineProps<{
  modelValue?: boolean;
  ruleInfo?: RuleInfo;
  operation?: 'add' | 'remove';
}>(), {
  modelValue: false,
  ruleInfo: () => ({type: '', name: '', mode: '模糊匹配'}),
  operation: 'add'
});
const emit = defineEmits(['update:modelValue']);

const dialogVisible = ref(false);
const inputVal = ref('');
const separator = ref(',');
const successAfterCloseVal = ref(true);
const selectedTypes = ref<string[]>([]);
const rememberedTypes = ref<string[]>([]);
const typeFilter = ref('');
const isSubmitting = ref(false);
/** 批量操作后让校验重新读取 GM 数据，避免对话框不关闭时汇总和按钮状态停留在操作前 */
const dataVersion = ref(0);

const mode = computed(() => props.ruleInfo.mode);
const allTypeOptions = computed<MultiTypeOption[]>(() => ruleKeyListData.getMultiTypeOptions(mode.value));
const optionMap = computed(() => new Map(allTypeOptions.value.map(item => [item.type, item])));
const currentTypeOption = computed(() => allTypeOptions.value.find(item => item.type === props.ruleInfo.type));
const selectedOptions = computed<MultiTypeOption[]>(() => {
  return selectedTypes.value
      .map(type => optionMap.value.get(type))
      .filter((item): item is MultiTypeOption => item !== undefined);
});
const filteredTypeOptions = computed(() => {
  const keyword = typeFilter.value.trim().toLowerCase();
  if (keyword === '') return allTypeOptions.value;
  return allTypeOptions.value.filter(item =>
      item.shortName.toLowerCase().includes(keyword)
      || item.name.toLowerCase().includes(keyword)
      || item.type.toLowerCase().includes(keyword)
  );
});
const fragments = computed(() => ruleUtil.splitRuleValues(inputVal.value, separator.value));
const validation = computed(() => {
  void dataVersion.value;
  return ruleUtil.validateMultiTypeGroup(fragments.value, selectedOptions.value, props.operation);
});

const dialogTitle = computed(() => props.operation === 'add' ? '批量添加规则' : '批量移除规则');
const submitLabel = computed(() => {
  const action = props.operation === 'add' ? '添加' : '移除';
  return validation.value.totalItems > 0 ? `${action} ${validation.value.totalItems} 项` : action;
});
const canSubmit = computed(() => validation.value.canSubmit && !isSubmitting.value);
const canRestoreRemembered = computed(() => {
  if (rememberedTypes.value.length === 0) return false;
  if (rememberedTypes.value.length !== selectedTypes.value.length) return true;
  return !rememberedTypes.value.every(type => selectedTypes.value.includes(type));
});

const summaryText = computed(() => {
  const data = validation.value;
  if (data.totalTypes === 0) return '请选择目标类型。';
  if (data.totalValues === 0) return '请输入规则值。';
  if (props.operation === 'add') {
    const stats = [`预计新增 ${data.totalNew}`, `已存在 ${data.totalExists}`];
    if (data.totalInvalid > 0) stats.push(`非法 ${data.totalInvalid}`);
    if (data.totalConflict > 0) stats.push(`冲突 ${data.totalConflict}`);
    return `将向 ${data.totalTypes} 个类型各添加 ${data.totalValues} 个值（共 ${data.totalItems} 项）；${stats.join('，')}。`;
  }
  const stats = [`预计移除 ${data.totalRemoved}`, `不存在 ${data.totalNotFound}`];
  if (data.totalInvalid > 0) stats.push(`非数字跳过 ${data.totalInvalid}`);
  return `将从 ${data.totalTypes} 个类型移除 ${data.totalValues} 个值（共 ${data.totalItems} 项）；${stats.join('，')}。`;
});

const intHintText = computed(() => {
  if (props.operation !== 'add' || !validation.value.intRequired) return '';
  const intNames = selectedOptions.value
      .filter(item => item.isInt)
      .map(item => item.shortName)
      .join('、');
  return `所选类型包含数字类型（${intNames}），整组必须是非负整数。`;
});

const intErrorText = computed(() => {
  if (props.operation !== 'add') return '';
  const data = validation.value;
  if (data.intInvalidValues.length === 0) return '';
  return `以下项不是整数：${data.intInvalidValues.join('、')}。请修正，或取消选择数字类型。`;
});

const regexWarningText = computed(() => {
  if (props.operation !== 'add') return '';
  const data = validation.value;
  if (data.regexInvalidValues.length === 0) return '';
  return `以下表达式不是合法正则，将跳过：${data.regexInvalidValues.join('、')}。`;
});

const whitelistWarningText = computed(() => {
  const data = validation.value;
  if (!data.whitelistSelected) return '';
  if (props.operation === 'remove') {
    return '所选类型包含用户uid白名单：从白名单移除后，该 uid 会重新参与屏蔽。';
  }
  if (data.whitelistConflict) {
    return '同时选中了用户uid和用户uid白名单：白名单优先，同一个 uid 的屏蔽会失效。';
  }
  return '所选类型包含用户uid白名单：白名单会放行匹配内容，不参与屏蔽。';
});

const videoTagConflictText = computed(() => {
  if (props.operation !== 'add') return '';
  const data = validation.value;
  if (data.videoTagConflictValues.length === 0) return '';
  return `以下值已存在于视频tag组合规则，视频tag（模糊/精确）将跳过：${data.videoTagConflictValues.join('、')}。如需添加，请先移除对应组合。`;
});

const highRiskWarningText = computed(() => {
  if (props.operation !== 'add') return '';
  const data = validation.value;
  if (data.highRiskTypes.length === 0) return '';
  const names = Array.from(new Set(
      selectedOptions.value
          .filter(item => data.highRiskTypes.includes(item.type))
          .map(item => item.shortName)
  ));
  const hasVideoTag = selectedOptions.value.some(item => item.isVideoTag);
  return `所选类型包含 ${names.join('、')}，会大范围影响页面内容${hasVideoTag ? '；视频tag包含分区' : ''}。`;
});

const confirmSummaryText = computed(() => {
  const data = validation.value;
  const lines = [
    `操作：${props.operation === 'add' ? '添加' : '移除'}`,
    `类型：${data.totalTypes} 个`,
    `值：${data.totalValues} 个（共 ${data.totalItems} 项）`,
    '',
    '类型明细：'
  ];
  for (const row of data.rows) {
    const parts: string[] = [];
    if (props.operation === 'add') {
      if (row.newCount > 0) parts.push(`新增 ${row.newCount}`);
      if (row.existsCount > 0) parts.push(`已存在 ${row.existsCount}`);
      if (row.invalidCount > 0) parts.push(`非法 ${row.invalidCount}`);
      if (row.conflictCount > 0) parts.push(`冲突 ${row.conflictCount}`);
    } else {
      if (row.removedCount > 0) parts.push(`移除 ${row.removedCount}`);
      if (row.notFoundCount > 0) parts.push(`不存在 ${row.notFoundCount}`);
      if (row.invalidCount > 0) parts.push(`非数字跳过 ${row.invalidCount}`);
    }
    lines.push(`- ${row.name}：${parts.join('，') || '无变化'}`);
  }
  const warnings = [
    intHintText.value,
    intErrorText.value,
    regexWarningText.value,
    whitelistWarningText.value,
    videoTagConflictText.value,
    highRiskWarningText.value
  ].filter(Boolean);
  if (warnings.length > 0) {
    lines.push('', '注意：', ...warnings.map(text => `- ${text}`));
  }
  return lines.join('\n');
});

const multiline = (text: string) => h('div', {
  style: 'white-space: pre-line; max-height: 340px; overflow-y: auto; line-height: 1.6;'
}, text);

/** 结果里最多展示 3 个具体值，避免 13 个类型刷屏 */
const formatValues = (values: (string | number)[]): string => {
  const shown = values.slice(0, 3).map(value => String(value));
  return `${shown.join('、')}${values.length > 3 ? ` 等 ${values.length} 项` : ''}`;
};

const buildResultText = (result: MultiTypeAddResult | MultiTypeDelResult): string => {
  if (props.operation === 'add') {
    const data = result as MultiTypeAddResult;
    const lines = [`添加完成：新增 ${data.totalAdded} 项，已存在 ${data.totalDuplicates} 项，非法 ${data.totalInvalid} 项，冲突 ${data.totalConflicts} 项。`];
    const exceptions = data.rows.filter(row =>
        row.duplicates.length > 0 || row.invalid.length > 0 || row.conflicts.length > 0
    );
    if (exceptions.length > 0) {
      lines.push('', '需要注意：');
      for (const row of exceptions) {
        const parts: string[] = [];
        if (row.added.length > 0) parts.push(`新增 ${row.added.length}`);
        if (row.duplicates.length > 0) parts.push(`已存在 ${row.duplicates.length}（${formatValues(row.duplicates)}）`);
        if (row.invalid.length > 0) parts.push(`非法 ${row.invalid.length}（${formatValues(row.invalid)}）`);
        if (row.conflicts.length > 0) parts.push(`冲突 ${row.conflicts.length}（${formatValues(row.conflicts)}）`);
        lines.push(`- ${row.name}：${parts.join('，')}`);
      }
    }
    if (data.totalAdded === 0) {
      lines.push('', '没有实际新增。');
    }
    return lines.join('\n');
  }

  const data = result as MultiTypeDelResult;
  const lines = [`移除完成：移除 ${data.totalRemoved} 项，不存在 ${data.totalNotFound} 项，非数字跳过 ${data.totalInvalid} 项。`];
  const exceptions = data.rows.filter(row => row.notFound.length > 0 || row.invalid.length > 0);
  if (exceptions.length > 0) {
    lines.push('', '需要注意：');
    for (const row of exceptions) {
      const parts: string[] = [];
      if (row.removed.length > 0) parts.push(`移除 ${row.removed.length}`);
      if (row.notFound.length > 0) parts.push(`不存在 ${row.notFound.length}（${formatValues(row.notFound)}）`);
      if (row.invalid.length > 0) parts.push(`非数字跳过 ${row.invalid.length}（${formatValues(row.invalid)}）`);
      lines.push(`- ${row.name}：${parts.join('，')}`);
    }
  }
  if (data.totalRemoved === 0) {
    lines.push('', '没有实际移除。');
  }
  return lines.join('\n');
};

const initSelection = () => {
  typeFilter.value = '';
  const validTypes = allTypeOptions.value.map(item => item.type);
  const remembered = getRememberedTypes(mode.value, validTypes);
  rememberedTypes.value = remembered;
  const current = props.ruleInfo.type;
  if (remembered.length > 0 && remembered.includes(current)) {
    selectedTypes.value = [...remembered];
  } else {
    selectedTypes.value = validTypes.includes(current) ? [current] : [];
  }
  inputVal.value = '';
  dataVersion.value++;
};

const syncSelectedTypes = (types: string[]) => {
  const valid = new Set(allTypeOptions.value.map(item => item.type));
  selectedTypes.value = Array.from(new Set(types.filter(type => valid.has(type))));
};

const selectAllTypes = () => {
  const merged = new Set(selectedTypes.value);
  for (const item of filteredTypeOptions.value) {
    merged.add(item.type);
  }
  selectedTypes.value = Array.from(merged);
};
const clearTypes = () => {
  selectedTypes.value = [];
};
const resetToCurrent = () => {
  selectedTypes.value = currentTypeOption.value ? [currentTypeOption.value.type] : [];
};
const restoreRemembered = () => {
  syncSelectedTypes(rememberedTypes.value);
};

const closeHandle = () => {
  inputVal.value = '';
  typeFilter.value = '';
  isSubmitting.value = false;
};

const onSubmit = async () => {
  if (!canSubmit.value) return;
  isSubmitting.value = true;
  try {
    if (selectedTypes.value.length > 6) {
      try {
        await ElMessageBox.confirm(
            multiline(confirmSummaryText.value),
            props.operation === 'add' ? '确认批量添加' : '确认批量移除',
            {
              confirmButtonText: props.operation === 'add' ? '确认添加' : '确认移除',
              cancelButtonText: '返回修改',
              type: 'warning'
            }
        );
      } catch {
        return;
      }
    }

    const result = props.operation === 'add'
        ? ruleUtil.batchAddRules(fragments.value, selectedOptions.value)
        : ruleUtil.batchDelRules(fragments.value, selectedOptions.value);
    rememberTypes(mode.value, selectedTypes.value);
    rememberedTypes.value = [...selectedTypes.value];
    dataVersion.value++;
    const changed = props.operation === 'add'
        ? (result as MultiTypeAddResult).totalAdded > 0
        : (result as MultiTypeDelResult).totalRemoved > 0;

    if (changed && props.operation === 'add') {
      eventEmitter.emit('通知屏蔽');
    }
    eventEmitter.send('刷新规则信息', false);
    try {
      await ElMessageBox.alert(multiline(buildResultText(result)), 'tip');
    } catch {
      // 用户通过关闭按钮/ESC 关闭结果提示，不影响已完成的批量操作
    }

    if (changed && successAfterCloseVal.value) {
      dialogVisible.value = false;
    }
  } catch (e) {
    ElMessage.error(`批量操作失败：${(e as Error).message}`);
  } finally {
    isSubmitting.value = false;
  }
};

watch(dialogVisible, (val) => {
  emit('update:modelValue', val);
});
watch(() => props.modelValue, (val) => {
  if (val === dialogVisible.value) return;
  dialogVisible.value = val;
  if (val) initSelection();
}, {immediate: true});
watch(() => props.ruleInfo.type, () => {
  if (dialogVisible.value) initSelection();
});
watch(() => props.ruleInfo.mode, () => {
  if (dialogVisible.value) initSelection();
});
</script>

<template>
  <div>
    <el-dialog
        v-model="dialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="min(760px, 92vw)"
        @close="closeHandle"
    >
      <template #header>
        <div class="mta-dialog-head">
          <div class="mta-dialog-title">{{ dialogTitle }}</div>
          <div class="mta-dialog-sub">
            当前类型：{{ currentTypeOption?.shortName || ruleInfo.name || '未选择' }} · 模式：{{ ruleInfo.mode || '未选择' }}
          </div>
        </div>
      </template>

      <div class="mta-body">
        <div class="mta-col-types">
          <el-card shadow="never" class="mta-card">
            <template #header>
              <div class="mta-card-head">
                <span class="mta-card-title">目标类型</span>
                <span class="mta-card-count">已选 {{ selectedTypes.length }} / {{ allTypeOptions.length }}</span>
              </div>
            </template>
            <div class="mta-quick">
              <el-button link type="primary" size="small" @click="selectAllTypes">全选</el-button>
              <el-button link size="small" @click="clearTypes">清空</el-button>
              <el-button link size="small" :disabled="!currentTypeOption" @click="resetToCurrent">重置为当前类型</el-button>
              <el-button v-if="canRestoreRemembered" link type="primary" size="small" @click="restoreRemembered">恢复上次选择</el-button>
            </div>
            <el-input v-model="typeFilter" class="mta-filter" size="small" clearable placeholder="筛选类型"/>
            <el-scrollbar max-height="260px">
              <el-checkbox-group v-model="selectedTypes" class="mta-type-group">
                <el-checkbox v-for="item in filteredTypeOptions" :key="item.type" :value="item.type" class="mta-type-row">
                  <span class="mta-type-name" :title="item.name">{{ item.shortName }}</span>
                  <el-tag v-if="item.type === ruleInfo.type" size="small" type="primary" effect="plain">当前</el-tag>
                  <el-tag v-if="item.isInt" size="small" type="warning" effect="plain">数字</el-tag>
                  <el-tag v-if="item.isWhitelist" size="small" type="danger" effect="plain">白名单</el-tag>
                </el-checkbox>
              </el-checkbox-group>
            </el-scrollbar>
            <div v-if="filteredTypeOptions.length === 0" class="mta-empty">
              {{ allTypeOptions.length === 0 ? '当前类型不支持多类型批量操作' : '没有匹配的类型' }}
            </div>
          </el-card>
        </div>

        <div class="mta-col-values">
          <el-card shadow="never" class="mta-card">
            <template #header>
              <div class="mta-card-head">
                <span class="mta-card-title">规则值</span>
                <span class="mta-card-count">{{ fragments.length }} 项</span>
              </div>
            </template>
            <el-form label-position="top" class="mta-form">
              <el-form-item label="输入项">
                <el-input v-model="inputVal" type="textarea" :rows="3" placeholder="多个值用分隔符分割，重复项会自动去重"/>
              </el-form-item>
              <el-form-item label="分隔符">
                <div class="mta-sep-row">
                  <el-input v-model="separator" style="width: 90px" placeholder="默认 ,"/>
                  <el-switch v-model="successAfterCloseVal"
                             :active-text="operation === 'add' ? '添加成功后关闭对话框' : '移除成功后关闭对话框'"/>
                </div>
              </el-form-item>
              <el-form-item label="分割项">
                <div class="mta-preview">
                  <el-tag v-for="v in fragments" :key="v" size="small">{{ v }}</el-tag>
                  <span v-if="fragments.length === 0" class="mta-empty">暂无分割项</span>
                </div>
              </el-form-item>
            </el-form>
            <div class="mta-summary">{{ summaryText }}</div>
            <div v-if="intHintText" class="mta-alert mta-alert-warning">{{ intHintText }}</div>
            <div v-if="intErrorText" class="mta-alert mta-alert-error">{{ intErrorText }}</div>
            <div v-if="regexWarningText" class="mta-alert mta-alert-warning">{{ regexWarningText }}</div>
            <div v-if="whitelistWarningText" class="mta-alert mta-alert-warning">{{ whitelistWarningText }}</div>
            <div v-if="videoTagConflictText" class="mta-alert mta-alert-warning">{{ videoTagConflictText }}</div>
            <div v-if="highRiskWarningText" class="mta-alert mta-alert-info">{{ highRiskWarningText }}</div>
          </el-card>
        </div>
      </div>

      <template #footer>
        <span class="mta-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!canSubmit" :loading="isSubmitting" @click="onSubmit">{{ submitLabel }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.mta-dialog-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mta-dialog-title {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.mta-dialog-sub {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.mta-body {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.mta-col-types {
  flex: 0 0 300px;
  min-width: 0;
}

.mta-col-values {
  flex: 1;
  min-width: 0;
}

.mta-card {
  border: 1px solid var(--el-border-color-lighter);
}

.mta-card :deep(.el-card__header) {
  padding: 10px 12px;
}

.mta-card :deep(.el-card__body) {
  padding: 10px 12px;
}

.mta-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mta-card-title {
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
}

.mta-card-count {
  color: var(--el-text-color-secondary);
  font-size: 11px;
}

.mta-quick {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  margin-bottom: 8px;
}

.mta-quick :deep(.el-button) {
  padding: 0 2px;
}

.mta-filter {
  margin-bottom: 6px;
}

.mta-type-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.mta-type-row {
  display: flex;
  align-items: center;
  width: 100%;
  height: 27px;
  margin-right: 0;
}

.mta-type-row :deep(.el-checkbox__label) {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 4px;
  width: auto;
  min-width: 0;
  padding-left: 8px;
}

.mta-type-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.mta-type-row :deep(.el-tag) {
  flex: none;
}

.mta-empty {
  padding: 12px 4px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  text-align: center;
}

.mta-preview .mta-empty {
  padding: 0;
  text-align: left;
}

.mta-form :deep(.el-form-item) {
  margin-bottom: 10px;
}

.mta-form :deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-size: 12px;
  line-height: 1.4;
}

.mta-sep-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  width: 100%;
}

.mta-preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-height: 22px;
}

.mta-summary {
  margin-top: 2px;
  padding: 8px 10px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.6;
}

.mta-alert {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.55;
  white-space: pre-line;
}

.mta-alert-error {
  border: 1px solid var(--el-color-danger-light-8);
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.mta-alert-warning {
  border: 1px solid var(--el-color-warning-light-8);
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.mta-alert-info {
  border: 1px solid var(--el-color-info-light-8);
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.mta-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.el-dialog__body) {
  max-height: 72vh;
  overflow-y: auto;
}

@media (max-width: 680px) {
  .mta-body {
    flex-direction: column;
  }

  .mta-col-types,
  .mta-col-values {
    flex: none;
    width: 100%;
  }
}
</style>
