<template>
  <div ref="rootRef" class="relative shrink-0">
    <button
      ref="btnRef"
      type="button"
      class="flex h-8 w-full items-center gap-1.5 rounded-[10px] border border-line bg-fill px-2.5 text-[12.5px] text-t2 transition-colors duration-150 hover:bg-fill2 hover:text-fg"
      :aria-expanded="open"
      @click="toggle"
    >
      <span class="min-w-0 flex-1 truncate text-left">{{ currentLabel }}</span>
      <ChevronDown
        :size="14"
        :stroke-width="2"
        class="shrink-0 transition-transform duration-150 ease-ui"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-ui"
        enter-from-class="opacity-0 -translate-y-1 scale-95"
        leave-active-class="transition duration-100 ease-ui"
        leave-to-class="opacity-0 -translate-y-1 scale-95"
      >
        <div
          v-if="open"
          ref="popupRef"
          class="ui-scroll fixed z-[1000] max-h-72 overflow-y-auto rounded-[12px] border border-line bg-menu py-1 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
          :style="popupStyle"
        >
          <button
            v-for="item in list"
            :key="item[itemKey]"
            type="button"
            class="block w-full truncate px-3 py-[7px] text-left text-[12.5px] transition-colors duration-100"
            :class="item[itemKey] === modelValue
              ? 'bg-accent/12 text-accent'
              : 'text-t2 hover:bg-fill hover:text-fg'"
            @click="handleSelect(item[itemKey])"
          >{{ item[itemName] }}</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from '@common/utils/vueTools'
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
const btnRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)
const popupStyle = ref<Record<string, string>>({})

const currentLabel = computed(() => {
  const hit = props.list.find((item: Record<string, any>) => item[props.itemKey] === props.modelValue)
  return hit ? String(hit[props.itemName]) : props.placeholder
})

// 弹层挂到 body：设置面板是滚动容器，absolute 会被裁掉，之前字体选择器就是这个原因点不到
const updatePosition = () => {
  const btn = btnRef.value
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const popupHeight = Math.min(popupRef.value?.scrollHeight ?? 288, 288)
  const openUp = rect.bottom + popupHeight + 8 > window.innerHeight && rect.top > popupHeight + 8
  popupStyle.value = {
    left: `${Math.round(rect.left)}px`,
    width: `${Math.round(rect.width)}px`,
    ...(openUp
      ? { bottom: `${Math.round(window.innerHeight - rect.top + 6)}px` }
      : { top: `${Math.round(rect.bottom + 6)}px` }),
  }
}

const toggle = () => {
  open.value = !open.value
  if (!open.value) return
  void nextTick(updatePosition)
}

const handleSelect = (value: string) => {
  open.value = false
  if (value === props.modelValue) return
  emit('update:modelValue', value)
  emit('change', value)
}

const handleDocumentClick = (event: MouseEvent) => {
  if (!open.value) return
  const target = event.target as Node
  if (rootRef.value?.contains(target)) return
  if (popupRef.value?.contains(target)) return
  open.value = false
}

const handleReposition = () => {
  if (open.value) updatePosition()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('resize', handleReposition)
  window.addEventListener('scroll', handleReposition, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('resize', handleReposition)
  window.removeEventListener('scroll', handleReposition, true)
})
</script>
