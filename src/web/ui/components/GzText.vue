<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
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
