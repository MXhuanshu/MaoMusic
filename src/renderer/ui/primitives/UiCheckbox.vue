<template>
  <!--
    设置里的选择项：布尔项渲染成开关（与 UiSwitch 同一样式），单选组渲染成圆点。
    保留 input+label 结构以兼容旧的 for/id 关联与 E2E 选择器。
  -->
  <label class="group inline-flex cursor-pointer select-none items-center gap-2.5" :for="id" :class="disabled ? 'cursor-default opacity-50' : ''">
    <input
      :id="id"
      ref="dom_input"
      :type="need ? 'radio' : 'checkbox'"
      :aria-hidden="true"
      :checked="checked"
      class="pointer-events-none absolute h-0 w-0 opacity-0"
      :disabled="disabled"
      :value="value"
      :name="name"
      @input="handleInput($event.target.checked)"
    >

    <span
      v-if="need"
      class="grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors duration-150 ease-ui"
      :class="checked ? 'border-accent' : 'border-line2 group-hover:border-accent/60'"
    >
      <span class="h-1.5 w-1.5 rounded-full transition-colors duration-150" :class="checked ? 'bg-accent' : 'bg-transparent'" />
    </span>
    <span
      v-else
      class="relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200 ease-ui"
      :class="checked ? 'bg-accent' : 'bg-track'"
      role="switch"
      :aria-checked="checked"
    >
      <span
        class="absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-ui"
        :class="checked ? 'left-[19px]' : 'left-[3px]'"
      />
    </span>

    <span
      v-if="label != null"
      class="text-[13px] leading-snug"
      :class="disabled ? 'text-t3 opacity-60' : 'text-fg'"
    >{{ label }}</span>
    <slot v-else />
  </label>
</template>

<script setup lang="ts">
import { ref, watch } from '@common/utils/vueTools'

const props = withDefaults(defineProps<{
  modelValue: any
  value?: any
  id?: string
  name?: string
  need?: boolean
  disabled?: boolean
  ariaLabel?: string
  label?: string | null
}>(), {
  value: undefined,
  id: undefined,
  name: undefined,
  need: false,
  disabled: false,
  ariaLabel: undefined,
  label: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'change', value: any): void
}>()

const checked = ref(false)

const setValue = (value: any) => {
  if (Array.isArray(value)) {
    checked.value = value.includes(props.value)
  } else if (typeof props.modelValue == 'boolean') {
    checked.value = props.modelValue
  } else if (value == null) {
    checked.value = props.modelValue != ''
  } else {
    checked.value = props.modelValue == props.value
  }
}

watch(() => props.modelValue, setValue, { immediate: true })

const handleInput = (isChecked: boolean) => {
  let modelValue
  if (Array.isArray(props.modelValue)) {
    modelValue = [...props.modelValue]
    if (isChecked) modelValue.push(props.value)
    else {
      const index = modelValue.indexOf(props.value)
      if (index > -1) modelValue.splice(index, 1)
    }
  } else if (typeof props.modelValue == 'boolean') {
    modelValue = isChecked
  } else {
    modelValue = isChecked ? props.value : ''
  }
  emit('update:modelValue', modelValue)
  emit('change', modelValue)
}

defineExpose({
  toggle: () => {
    emit('update:modelValue', !checked.value)
  },
})
</script>
