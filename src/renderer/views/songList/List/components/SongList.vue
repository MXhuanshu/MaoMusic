<template>
  <div class="relative h-full">
    <div v-show="!props.listInfo.noItemLabel" ref="dom_list_ref" class="ui-scroll absolute inset-0 pb-2">
      <!-- 磁贴墙：无间隙铺满，悬停浮出标题与来源，和播放详情的磁贴保持同一套语言 -->
      <div class="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))]">
        <button
          v-for="item in props.listInfo.list"
          :key="item.id"
          type="button"
          class="group relative block aspect-square overflow-hidden bg-fill2 text-left"
          @click="toDetail(item)"
        >
          <img
            v-if="item.img"
            class="h-full w-full object-cover transition-transform duration-500 ease-ui group-hover:scale-[1.06]"
            loading="lazy"
            decoding="async"
            :src="item.img"
          >
          <div v-else class="grid h-full w-full place-items-center text-t3">
            <Music2 :size="26" :stroke-width="1.6" />
          </div>

          <!-- 常驻的轻压暗，保证封面过亮时文字也能读 -->
          <span class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <span class="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/25" />

          <span
            v-if="item.play_count != null"
            class="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/45 px-1.5 py-0.5 text-[10.5px] leading-none text-white/90 backdrop-blur-sm"
          >
            <Headphones :size="11" :stroke-width="2" />{{ item.play_count }}
          </span>

          <span
            class="absolute inset-x-0 bottom-0 translate-y-2 p-2.5 opacity-0 transition-all duration-300 ease-ui group-hover:translate-y-0 group-hover:opacity-100"
          >
            <span class="line-clamp-2 text-[12.5px] font-medium leading-snug text-white">{{ item.name }}</span>
            <span class="mt-1 flex items-center gap-2 text-[10.5px] text-white/70">
              <span v-if="item.total != null" class="flex items-center gap-1">
                <Music :size="11" :stroke-width="2" />{{ item.total }}
              </span>
              <span v-if="item.author" class="truncate">{{ item.author }}</span>
              <span v-if="visibleSource && item.source" class="truncate">{{ item.source }}</span>
            </span>
          </span>
        </button>
      </div>

      <div class="px-4">
        <UiPagination
          :count="props.listInfo.total"
          :limit="props.listInfo.limit"
          :page="props.listInfo.page"
          @btn-click="togglePage"
        />
      </div>
    </div>

    <div v-if="props.listInfo.noItemLabel" class="absolute inset-0">
      <UiEmptyState :title="props.listInfo.noItemLabel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from '@common/utils/vueTools'
import { Headphones, Music, Music2 } from 'lucide-vue-next'
import type { ListInfo, ListInfoItem } from '@renderer/store/songList/state'
import { useRoute, useRouter } from '@common/utils/vueRouter'
import UiEmptyState from '@renderer/ui/primitives/UiEmptyState.vue'
import UiPagination from '@renderer/ui/primitives/UiPagination.vue'

const props = withDefaults(defineProps<{
  listInfo: ListInfo
  visibleSource?: boolean
}>(), {
  visibleSource: false,
})

const router = useRouter()
const route = useRoute()

const dom_list_ref = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  'toggle-page': [page: number]
}>()

const togglePage = (page: number) => {
  emit('toggle-page', page)
}

const toDetail = (info: ListInfoItem) => {
  void router.push({
    path: '/songList/detail',
    query: {
      source: info.source,
      id: info.id,
      picUrl: info.img,
      fromName: route.name as string,
    },
  })
}

defineExpose({
  scrollTo(top: number) {
    dom_list_ref.value?.scrollTo({ top })
  },
  getScrollTop() {
    return dom_list_ref.value?.scrollTop ?? 0
  },
})
</script>
