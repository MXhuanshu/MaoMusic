<template>
  <label class="inline-flex min-h-9 items-center gap-2.5" :class="disabled ? 'cursor-default opacity-50' : 'cursor-pointer'">
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

    <!-- 单选：圆形单选点；开关：与 UiSwitch 一致的滑块，避免设置页出现两套开关 -->
    <span
      v-if="need"
      class="grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors duration-150"
      :class="checked ? 'border-accent' : 'border-line2'"
      :role="'radio'"
      tabindex="0"
      :aria-label="ariaLabel || label"
      :aria-checked="checked"
      :aria-disabled="disabled"
      @keydown.enter.space.stop.prevent="handleToggle"
    >
      <span class="h-1.5 w-1.5 rounded-full transition-colors duration-150" :class="checked ? 'bg-accent' : 'bg-transparent'" />
    </span>
    <span
      v-else
      class="relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200"
      :class="checked ? 'bg-accent' : 'bg-track'"
      role="switch"
      tabindex="0"
      :aria-label="ariaLabel || label"
      :aria-checked="checked"
      :aria-disabled="disabled"
      @keydown.enter.space.stop.prevent="handleToggle"
    >
      <span
        class="absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-ui"
        :class="checked ? 'left-[19px]' : 'left-[3px]'"
      />
    </span>

    <slot v-if="label == null" />
    <span v-else class="leading-relaxed">{{ label }}</span>
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
