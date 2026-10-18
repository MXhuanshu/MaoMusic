<template>
  <transition name="tips-fade" @after-leave="afterLeave">
    <div
      v-show="visible"
      ref="dom_tips"
      class="pointer-events-none fixed z-[10001] overflow-hidden whitespace-pre-wrap break-words rounded-[6px] bg-menu px-1.5 py-1 text-[12px] leading-tight text-fg shadow-[0_2px_10px_rgba(0,0,0,.4)] ring-1 ring-line"
      :style="{ left: position.left + 'px' , top: position.top + 'px', transform, maxWidth }"
      role="presentation"
    >
      {{ message }}
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    afterLeave: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      visible: false,
      message: '',
      position: {
        top: 0,
        left: 0,
      },
      transform: 'translate(0, 0)',
      maxWidth: '80%',
      cancel: null,
      setTips: null,
      aotoCloseTimer: null,
    }
  },
  watch: {
    message() {
      this.$nextTick(() => {
        this.maxWidth = this.handleGetMaxWidth(this.position.left) + 'px'
        this.$nextTick(() => {
          this.transform = `translate(${this.handleGetOffsetXY(this.position.left, this.position.top)})`
        })
      })
    },
  },
  beforeUnmount() {
    const el = this.$el
    el.parentNode.removeChild(el)
  },
  methods: {
    handleGetMaxWidth(left) {
      const containerWidth = document.documentElement.clientWidth
      let maxWidth = containerWidth - left
      return (maxWidth > left ? maxWidth : left - 12) - 30
    },
    handleGetOffsetXY(left, top) {
      const tipsWidth = this.$refs.dom_tips.clientWidth
      const tipsHeight = this.$refs.dom_tips.clientHeight
      const dom_container = document.documentElement
      const containerWidth = dom_container.clientWidth
      const containerHeight = dom_container.clientHeight
      const offsetWidth = containerWidth - left - tipsWidth
      const offsetHeight = containerHeight - top - tipsHeight
      let x = 0
      let y = 0
      if (tipsWidth < left && containerWidth > tipsWidth && offsetWidth < 5) {
        x = -tipsWidth - 12
      }
      if (tipsHeight < top && containerHeight > tipsHeight && offsetHeight < 5) {
        y = -tipsHeight - 8
      }
      return `${x}px, ${y}px`
    },
  },
}
</script>

<style scoped>
.tips-fade-enter-active,
.tips-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tips-fade-enter,
.tips-fade-leave-to {
  opacity: 0;
}
</style>
