<template>
  <button
    type="button"
    :disabled="props.disabled"
    class="inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 ease-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-default disabled:opacity-40"
    :class="[variantClass, sizeClass]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from '@common/utils/vueTools'
import { BUTTON_SIZE, BUTTON_VARIANT } from '../tokens/classMap'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'iconSm'
  disabled?: boolean
}>(), {
  variant: 'secondary',
  size: 'md',
  disabled: false,
})

// 索引在脚本里做，并显式收窄：本工程 SFC 里 props 的泛型推断会退化成 any
const variantClass = computed(() => BUTTON_VARIANT[(props.variant ?? 'secondary') as keyof typeof BUTTON_VARIANT])
const sizeClass = computed(() => BUTTON_SIZE[(props.size ?? 'md') as keyof typeof BUTTON_SIZE])
</script>
