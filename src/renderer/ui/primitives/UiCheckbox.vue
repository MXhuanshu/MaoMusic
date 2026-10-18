<template>
  <!--
    复选框 / 单选二合一：与旧 base-checkbox 签名一致，need + value 时表现为单选组。
    保留 input+label 结构以兼容旧的 for/id 关联与 E2E 选择器。
  -->
  <label class="group inline-flex cursor-pointer select-none items-start gap-2.5" :for="id">
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
      class="relative mt-px flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-150 ease-ui"
      :class="[
        checked ? 'border-accent bg-accent' : 'border-line2 bg-fill group-hover:border-accent/60',
        disabled ? 'opacity-40' : '',
      ]"
    >
      <Check v-if="checked" :size="12" :stroke-width="3" class="text-on-accent" />
      <span
        v-if="need"
        class="absolute h-[7px] w-[7px] rounded-full"
        :class="checked ? 'bg-on-accent' : ''"
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
import { Check } from 'lucide-vue-next'
import { ref, watch } from '@common/utils/vueTools'

const props = withDefaults(defineProps<{
  modelValue: any
  value?: any
  id?: string
  name?: string
  need?: boolean
  ariaLabel?: string
  label?: string | null
}>(), {
  value: undefined,
  id: undefined,
  name: undefined,
  need: false,
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
