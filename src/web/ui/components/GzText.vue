<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: "GzText"
})
</script>

<template>
<span style="font-size:14px;
          margin: 0;
          padding: 0;
          overflow-wrap: break-word;">
  <slot></slot>
</span>
</template>
