<template>
  <label class="inline-flex items-center" :class="disabled ? 'cursor-default opacity-50' : 'cursor-pointer'">
    <input
      :id="id"
      ref="dom_input"
      :type="need ? 'radio' : 'checkbox'"
      class="sr-only"
      :checked="checked"
      :disabled="disabled"
      :value="value"
      :name="name"
      aria-hidden="true"
      @input="handleInput($event.target.checked)"
    >
    <span
      class="grid h-[14px] w-[14px] shrink-0 place-items-center rounded-[4px] border transition-colors duration-150 ease-ui"
      :class="checked ? 'border-accent bg-accent/15 text-accent' : 'border-line2 text-transparent'"
      :role="need ? 'radio' : 'checkbox'"
      tabindex="0"
      :aria-label="ariaLabel || label"
      :aria-checked="checked"
      :aria-disabled="disabled"
      @keydown.enter.space.stop.prevent="handleToggle"
    >
      <svg
        version="1.1"
        class="h-full w-full transition-transform duration-150 ease-ui"
        :class="checked ? 'scale-100' : 'scale-0'"
        xmlns="http://www.w3.org/2000/svg"
        xlink="http://www.w3.org/1999/xlink"
        height="100%"
        width="100%"
        viewBox="0 32 448 448"
        space="preserve"
      >
        <use xlink:href="#icon-check-true" />
      </svg>
    </span>
    <slot v-if="label == null" />
    <span v-else class="ml-1.5 flex-auto cursor-pointer leading-relaxed">{{ label }}</span>
  </label>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: [String, Boolean, Number, Array],
      required: true,
    },
    value: {
      type: [String, Boolean, Number, Array],
      default: undefined,
    },
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: undefined,
    },
    need: {
      type: Boolean,
      default: false,
    },
    ariaLabel: {
      type: String,
      default: undefined,
    },
    label: {
      type: String,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      checked: false,
    }
  },
  watch: {
    modelValue(n) {
      this.setValue(n)
    },
  },
  mounted() {
    this.setValue(this.modelValue)
  },
  methods: {
    handleInput(checked) {
      let modelValue
      if (Array.isArray(this.modelValue)) {
        modelValue = [...this.modelValue]
        if (checked) modelValue.push(this.value)
        else {
          const index = modelValue.indexOf(this.value)
          if (index > -1) modelValue.splice(index, 1)
        }
      } else {
        if (typeof this.modelValue == 'boolean') {
          modelValue = checked
        } else modelValue = checked ? this.value : ''
      }
      this.$emit('update:modelValue', modelValue)
      this.$emit('change', modelValue)
    },
    setValue(value) {
      let checked
      if (Array.isArray(value)) {
        checked = value.includes(this.value)
      } else {
        if (typeof this.modelValue == 'boolean') {
          checked = this.modelValue
        } else if (value == null) checked = this.modelValue != ''
        else checked = this.modelValue == this.value
      }
      if (this.checked == checked) return
      this.checked = checked
    },
    handleToggle(event) {
      event.lx_handled = true
      if (this.need) {
        if (this.$refs.dom_input.checked) return
        this.$refs.dom_input.checked = true
        this.handleInput(true)
      } else {
        this.$refs.dom_input.checked = !this.$refs.dom_input.checked
        this.handleInput(this.$refs.dom_input.checked)
      }
    },
  },
}
</script>
