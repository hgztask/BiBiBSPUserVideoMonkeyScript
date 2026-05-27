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
    },
    alignItems: {
      type: String,
      default: 'center'
    },
    justifyContent: {
      type: String,
      default: 'flex-start'
    }
  },
  computed: {
    sizeStyle() {
      return {
        display: 'flex',
        gap: this.size,
        'align-items': this.alignItems,
        'flex-direction': this.direction === 'row' ? 'row' : 'column',
        'flex-wrap': this.wrap ? 'wrap' : 'nowrap',
        'justify-content': this.justifyContent
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