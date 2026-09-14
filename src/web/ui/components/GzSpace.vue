<script setup lang="ts">
import {computed} from 'vue';

const props = withDefaults(defineProps<{
    wrap?: boolean;
    size?: string;
    direction?: string;
    alignItems?: string;
    justifyContent?: string;
}>(), {
    wrap: false,
    size: '8px',
    direction: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
});

const sizeStyle = computed<Record<string, string>>(() => ({
    display: 'flex',
    gap: props.size,
    'align-items': props.alignItems,
    'flex-direction': props.direction === 'row' ? 'row' : 'column',
    'flex-wrap': props.wrap ? 'wrap' : 'nowrap',
    'justify-content': props.justifyContent
}));
</script>

<template>
  <div :style='sizeStyle'>
    <slot></slot>
  </div>
</template>
