<template>
  <!-- 胶囊分段控件：容器一层浅底，选中项抬起成实心块 -->
  <div class="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-fill p-0.5">
    <button
      v-for="item in list"
      :key="item.id"
      type="button"
      class="h-7 rounded-full px-3 text-[12px] font-medium transition-colors duration-150 ease-ui"
      :class="item.id === modelValue
        ? 'bg-raise text-fg shadow-sm'
        : 'text-t3 hover:text-fg'"
      @click="handleSelect(item.id)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface SegmentedItem {
  id: string
  label: string
}

defineProps<{
  list: SegmentedItem[]
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
