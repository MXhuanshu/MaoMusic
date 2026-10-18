<template>
  <!-- Folia 设置面板的开关行：标题 + 描述 + 右侧滑块开关 -->
  <div class="flex min-h-11 items-center gap-4 py-[7px]">
    <div class="min-w-0 flex-1">
      <div class="text-[13px] leading-snug text-fg">
        <slot name="label">{{ label }}</slot>
      </div>
      <div v-if="description || $slots.description" class="mt-1 text-[11.5px] leading-relaxed text-t3">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>

    <button
      v-if="!disabled"
      type="button"
      role="switch"
      :aria-checked="modelValue"
      class="relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200 ease-ui"
      :class="modelValue ? 'bg-accent' : 'bg-track'"
      @click="toggle"
    >
      <span
        class="absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-ui"
        :class="modelValue ? 'left-[19px]' : 'left-[3px]'"
      />
    </button>
    <span v-else class="shrink-0 text-[11.5px] text-t3">
      <slot name="disabled-tip">{{ disabledTip }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  label?: string
  description?: string
  disabled?: boolean
  disabledTip?: string
}>(), {
  label: '',
  description: '',
  disabled: false,
  disabledTip: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}>()

const toggle = () => {
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}
</script>
