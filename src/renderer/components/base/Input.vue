<template>
  <input
    ref="dom_input"
    class="inline-block w-full rounded-[8px] bg-fill px-2 py-1.5 text-[13px] text-fg outline-none transition-colors duration-150 ease-ui placeholder:text-t3 hover:bg-raise focus:bg-raise active:bg-raise disabled:opacity-40"
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    :disabled="disabled"
    tabindex="0"
    @input="handleInput"
    @change="$emit('change', $event.target.value.trim())"
    @keyup.enter="$emit('submit', $event.target.value.trim())"
    @contextmenu="handleContextMenu"
  >
</template>

<script>
import { clipboardReadText } from '@common/utils/electron'

export default {
  props: {
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    trim: {
      type: Boolean,
      default: true,
    },
    stopContentEventPropagation: {
      type: Boolean,
      default: true,
    },
    autoPaste: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'submit', 'change'],
  methods: {
    handleInput(event) {
      let value = event.target.value
      if (this.trim) {
        value = value.trim()
        event.target.value = value
      }
      this.$emit('update:modelValue', value)
    },
    focus() {
      this.$refs.dom_input.focus()
    },
    handleContextMenu(event) {
      if (this.stopContentEventPropagation) event.stopPropagation()
      if (!this.autoPaste) return
      let dom_input = this.$refs.dom_input
      if (dom_input.selectionStart === null) return
      let str = clipboardReadText()
      str = str.trim()
      str = str.replace(/\t|\r\n|\n|\r/g, ' ')
      str = str.replace(/\s+/g, ' ')
      const text = dom_input.value
      const value = text.substring(0, dom_input.selectionStart) + str + text.substring(dom_input.selectionEnd, text.length)
      event.target.value = value
      this.$emit('update:modelValue', value)
    },
  },
}
</script>
