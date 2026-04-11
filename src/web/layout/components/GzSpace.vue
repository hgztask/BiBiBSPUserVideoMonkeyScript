<script>
export default {
  name: "GzSpace",
  props: {
    wrap: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: '8px'
    },
    direction: {
      type: String,
      default: 'row'
    }
  },
  computed: {
    sizeStyle() {
      return {
        display: 'flex',
        gap: this.size,
        'flex-direction': this.direction === 'row' ? 'row' : 'column',
        'flex-wrap': this.wrap ? 'wrap' : 'nowrap'
      }
    }
  }
}
</script>

<template>
  <div :style='sizeStyle'>
    <slot></slot>
  </div>
</template>