<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
    <div class="grid h-12 w-12 place-items-center rounded-2xl bg-fill text-t3">
      <slot name="icon">
        <Music2 :size="22" :stroke-width="1.6" />
      </slot>
    </div>
    <p class="text-[15px] font-medium text-t2">{{ title }}</p>
    <p v-if="description" class="max-w-[26rem] text-[12.5px] leading-relaxed text-t3">{{ description }}</p>
    <div v-if="$slots.default" class="mt-1">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Music2 } from 'lucide-vue-next'

withDefaults(defineProps<{
  title: string
  description?: string
}>(), {
  description: '',
})
</script>
