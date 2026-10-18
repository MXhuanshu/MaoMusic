<template>
  <div ref="rootRef" class="relative shrink-0">
    <button
      type="button"
      class="flex h-8 items-center gap-1.5 rounded-[10px] border border-line bg-fill px-2.5 text-[12.5px] text-t2 transition-colors duration-150 hover:bg-fill2 hover:text-fg"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="max-w-[9rem] truncate">{{ currentLabel }}</span>
      <ChevronDown
        :size="14"
        :stroke-width="2"
        class="shrink-0 transition-transform duration-150 ease-ui"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-ui"
      enter-from-class="opacity-0 -translate-y-1 scale-95"
      leave-active-class="transition duration-100 ease-ui"
      leave-to-class="opacity-0 -translate-y-1 scale-95"
    >
      <div
        v-if="open"
        class="ui-scroll absolute right-0 top-[calc(100%+6px)] z-50 max-h-64 min-w-full overflow-y-auto rounded-[12px] border border-line bg-menu py-1 shadow-[0_16px_40px_rgba(0,0,0,0.36)]"
      >
        <button
          v-for="item in list"
          :key="item[itemKey]"
          type="button"
          class="block w-full whitespace-nowrap px-3 py-[7px] text-left text-[12.5px] transition-colors duration-100"
          :class="item[itemKey] === modelValue
            ? 'bg-accent/12 text-accent'
            : 'text-t2 hover:bg-fill hover:text-fg'"
          @click="handleSelect(item[itemKey])"
        >{{ item[itemName] }}</button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from '@common/utils/vueTools'
import { ChevronDown } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: string
  list: Array<Record<string, any>>
  itemKey?: string
  itemName?: string
  placeholder?: string
}>(), {
  itemKey: 'id',
  itemName: 'name',
  placeholder: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const currentLabel = computed(() => {
  const hit = props.list.find((item: Record<string, any>) => item[props.itemKey] === props.modelValue)
  return hit ? String(hit[props.itemName]) : props.placeholder
})

const handleSelect = (value: string) => {
  open.value = false
  if (value === props.modelValue) return
  emit('update:modelValue', value)
  emit('change', value)
}

const handleDocumentClick = (event: MouseEvent) => {
  if (!open.value) return
  if (rootRef.value?.contains(event.target as Node)) return
  open.value = false
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>
