<template>
  <!--
    播放详情的右侧玻璃抽屉：360px 固定宽度，顶部页签，内容区独立滚动。
    槽位按页签 id 命名（#lyric / #comment / #info），由父组件决定放什么。
  -->
  <aside
    class="pointer-events-auto flex w-[360px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-line bg-glass shadow-[var(--pn-shadow)] backdrop-blur-[40px] backdrop-saturate-150"
  >
    <header class="flex h-11 shrink-0 items-center gap-2 border-b border-line px-3">
      <UiTabs
        class="min-w-0 flex-1"
        :list="tabs"
        :model-value="modelValue"
        @update:model-value="handleSelect"
      />
      <button
        v-if="closable"
        type="button"
        class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-t3 transition-colors duration-150 hover:bg-fill hover:text-fg"
        :aria-label="$t('close')"
        @click="emit('close')"
      >
        <X :size="14" :stroke-width="2" />
      </button>
    </header>

    <div class="ui-scroll min-h-0 flex-1 overflow-y-auto">
      <slot :name="modelValue" />
    </div>

    <slot name="footer" />
  </aside>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import UiTabs from '../../primitives/UiTabs.vue'

interface PanelTab {
  id: string
  label: string
}

const props = withDefaults(defineProps<{
  tabs: PanelTab[]
  modelValue: string
  closable?: boolean
}>(), {
  closable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  close: []
}>()

const handleSelect = (id: string) => {
  if (id === props.modelValue) return
  emit('update:modelValue', id)
}
</script>
