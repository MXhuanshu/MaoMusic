<template>
  <div class="relative inline-block w-[var(--selection-width,300px)] text-[12px]">
    <div
      ref="dom_btn"
      class="flex h-7 cursor-pointer items-center rounded-[8px] px-2.5 text-fg transition-colors duration-150 ease-ui hover:bg-raise"
      :class="show ? 'bg-raise' : 'bg-fill'"
      @click="handleShow"
    >
      <span class="flex-auto truncate">{{ label }}</span>
      <div class="ml-[7px] flex-none leading-none">
        <svg
          version="1.1"
          class="w-[1em] transition-transform duration-200 ease-ui"
          :class="show ? 'rotate-180' : 'rotate-0'"
          xmlns="http://www.w3.org/2000/svg"
          xlink="http://www.w3.org/1999/xlink"
          height="100%"
          viewBox="0 0 451.847 451.847"
          space="preserve"
        >
          <use xlink:href="#icon-down" />
        </svg>
      </div>
    </div>
    <ul
      v-if="show"
      ref="dom_list"
      class="absolute inset-x-0 top-0 z-10 max-h-[200px] origin-[0_14px] overflow-auto rounded-[8px] bg-menu text-fg shadow-[0_4px_16px_rgba(0,0,0,.35)] ring-1 ring-line transition-[transform,opacity] duration-200 ease-ui"
      :class="show ? 'opacity-100' : 'opacity-0'"
      :style="listStyles"
    >
      <li
        v-for="(item, index) in list"
        :key="index"
        class="cursor-pointer truncate px-2.5 leading-7 outline-none transition-colors duration-150 hover:bg-fill active:bg-raise"
        :class="(itemKey ? item[itemKey] : item) == modelValue ? 'text-accent' : ''"
        :aria-label="itemName ? item[itemName] : item"
        @click="handleClick(item)"
      >
        {{ itemName ? item[itemName] : item }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      },
    },
    modelValue: {
      type: [String, Number],
      required: true,
    },
    itemName: {
      type: String,
      default: '',
    },
    itemKey: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      show: false,
      listStyles: {
        transform: 'scaleY(0) translateY(0)',
      },
    }
  },
  computed: {
    activeIndex() {
      if (this.modelValue == null) return -1
      if (!this.itemName) return this.list.indexOf(this.modelValue)
      return this.list.findIndex(l => l[this.itemKey] == this.modelValue)
    },
    label() {
      if (this.modelValue == null) return ''
      if (this.itemName == null) return this.modelValue
      const item = this.list[this.activeIndex]
      if (!item) return ''
      return item[this.itemName]
    },
  },
  mounted() {
    document.addEventListener('click', this.handleHide, true)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleHide, true)
  },
  methods: {
    handleHide(e) {
      if (!this.show) return
      if (e && (e.target == this.$refs.dom_btn || this.$refs.dom_btn.contains(e.target))) return
      this.listStyles.transform = 'scaleY(0) translateY(0)'
      setTimeout(() => {
        this.show = false
      }, 50)
    },
    handleClick(item) {
      if (item === this.modelValue) return
      this.$emit('update:modelValue', this.itemKey ? item[this.itemKey] : item)
      this.$emit('change', item)
    },
    handleShow() {
      this.show = true
      this.$nextTick(() => {
        this.listStyles.transform = `scaleY(1) translateY(${this.handleGetOffset()}px)`

        const activeItem = this.$refs.dom_list.children[this.activeIndex]
        if (activeItem) this.$refs.dom_list.scrollTop = activeItem.offsetTop - this.$refs.dom_list.clientHeight * 0.38
      })
    },
    handleGetOffset() {
      const listHeight = this.$refs.dom_list.clientHeight
      const dom_select = this.$refs.dom_list.offsetParent
      const dom_container = dom_select.offsetParent
      const containerHeight = dom_container.clientHeight
      if (containerHeight < listHeight) return 0
      const offsetHeight = (dom_container.scrollTop + containerHeight) - (dom_select.offsetTop + listHeight)
      if (offsetHeight > 0) return 0
      return offsetHeight - 5
    },
  },
}
</script>
