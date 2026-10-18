<template>
  <!--
    歌曲磁贴墙：所有「列表」统一用它铺满，无间隙、悬停浮出信息与操作。
    行/列自适应，图片懒加载；操作按钮由调用方通过 #actions 插槽提供。
  -->
  <div ref="rootRef" class="ui-scroll h-full overflow-y-auto" @contextmenu.capture="$emit('list-contextmenu', $event)">
    <div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
      <div
        v-for="(item, index) in list"
        :key="item.id"
        class="group relative aspect-square cursor-default overflow-hidden bg-fill2"
        :class="[
          playingIndex === index ? 'ring-2 ring-inset ring-accent' : '',
          selectedList.includes(item) ? 'ring-2 ring-inset ring-accent/60' : '',
        ]"
        @click="handleClick($event, Number(index))"
        @contextmenu="handleContextMenu($event, Number(index))"
      >
        <img
          v-if="coverOf(item)"
          class="h-full w-full object-cover transition-transform duration-500 ease-ui group-hover:scale-[1.06]"
          loading="lazy"
          decoding="async"
          :src="coverOf(item)"
          alt=""
        >
        <div v-else class="grid h-full w-full place-items-center text-t3">
          <Music2 :size="26" :stroke-width="1.6" />
        </div>

        <span class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

        <span
          v-if="playingIndex === index"
          class="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-black/50 text-accent backdrop-blur-sm"
        >
          <Volume2 :size="12" :stroke-width="2.4" />
        </span>
        <span v-else class="absolute left-2 top-2 text-[10.5px] tabular-nums text-white/60">{{ index + 1 }}</span>

        <span v-if="sourceTag && item.source" class="absolute right-2 top-2 rounded-full bg-black/45 px-1.5 py-0.5 text-[10px] leading-none text-white/80 backdrop-blur-sm">
          {{ item.source }}
        </span>

        <span class="absolute inset-x-0 bottom-0 p-2.5">
          <span class="line-clamp-1 text-[12.5px] font-medium text-white">{{ titleOf(item) }}</span>
          <span class="mt-0.5 line-clamp-1 text-[10.5px] text-white/70">{{ subtitleOf(item) }}</span>
        </span>

        <span
          v-if="$slots.actions"
          class="absolute bottom-2 right-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          @click.stop
        >
          <slot name="actions" :item="item" :index="index" />
        </span>
      </div>
    </div>

    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
import { ref } from '@common/utils/vueTools'
import { Music2, Volume2 } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  list: any[]
  playingIndex?: number
  selectedList?: any[]
  sourceTag?: boolean
  subtitleKey?: string
}>(), {
  playingIndex: -1,
  selectedList: () => [],
  sourceTag: false,
  subtitleKey: 'album',
})

defineSlots<{
  actions: (props: { item: any, index: number }) => any
  footer: () => any
}>()

const emit = defineEmits<{
  'item-click': [event: MouseEvent, index: number]
  'item-contextmenu': [event: MouseEvent, index: number]
  'list-contextmenu': [event: MouseEvent]
}>()

const rootRef = ref<HTMLElement | null>(null)

const coverOf = (item: any): string | undefined => item?.pic ?? item?.musicInfo?.pic ?? item?.metadata?.picUrl

const titleOf = (item: any): string => item?.name ?? item?.musicInfo?.name ?? ''

const subtitleOf = (item: any): string => {
  if (props.subtitleKey === 'none') return ''
  const singer = item?.singer ?? item?.musicInfo?.singer ?? ''
  if (props.subtitleKey === 'singer') return singer
  const album = item?.meta?.albumName ?? item?.musicInfo?.meta?.albumName ?? ''
  return [singer, album].filter(Boolean).join(' · ')
}

const handleClick = (event: MouseEvent, index: number) => {
  emit('item-click', event, index)
}

const handleContextMenu = (event: MouseEvent, index: number) => {
  emit('item-contextmenu', event, index)
}

defineExpose({
  scrollTo(top: number) {
    rootRef.value?.scrollTo({ top })
  },
  getScrollTop() {
    return rootRef.value?.scrollTop ?? 0
  },
  scrollToIndex(index: number) {
    const node = rootRef.value?.children[0]?.children[index] as HTMLElement | undefined
    node?.scrollIntoView({ block: 'center' })
  },
})
</script>
