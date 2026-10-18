<template>
  <div class="flex items-center gap-1 overflow-x-auto ui-scroll-hidden">
    <button
      v-for="item in list"
      :key="item.id"
      type="button"
      class="relative h-9 shrink-0 px-1 text-[13px] transition-colors duration-150 ease-ui"
      :class="item.id === modelValue ? 'text-fg' : 'text-t3 hover:text-fg'"
      @click="handleSelect(item.id)"
    >
      <span class="whitespace-nowrap">{{ item.label }}</span>
      <span
        class="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-accent transition-opacity duration-150 ease-ui"
        :class="item.id === modelValue ? 'opacity-100' : 'opacity-0'"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
interface TabItem {
  id: string
  label: string
}

defineProps<{
  list: TabItem[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const handleSelect = (id: string) => {
  emit('update:modelValue', id)
  emit('change', id)
}
</script>
