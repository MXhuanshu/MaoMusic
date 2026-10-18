<template>
  <div class="relative h-full">
    <div v-show="!props.listInfo.noItemLabel" ref="dom_list_ref" class="ui-scroll absolute inset-0 px-4 pb-2 pt-3">
      <div class="grid grid-cols-[repeat(auto-fill,minmax(188px,1fr))] gap-x-3 gap-y-5">
        <button
          v-for="item in props.listInfo.list"
          :key="item.id"
          type="button"
          class="group block text-left"
          @click="toDetail(item)"
        >
          <!-- 封面 -->
          <div class="relative aspect-square overflow-hidden rounded-[12px] bg-fill2">
            <img
              class="h-full w-full object-cover transition-transform duration-300 ease-ui group-hover:scale-[1.06]"
              loading="lazy"
              decoding="async"
              :src="item.img"
            >
            <span
              v-if="item.play_count != null"
              class="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/45 px-1.5 py-0.5 text-[10.5px] leading-none text-white/90 backdrop-blur-sm"
            >
              <Headphones :size="11" :stroke-width="2" />{{ item.play_count }}
            </span>
            <span class="pointer-events-none absolute inset-0 rounded-[12px] ring-1 ring-inset ring-white/5" />
          </div>

          <!-- 文案 -->
          <p class="mt-2 line-clamp-2 px-0.5 text-[12.5px] leading-snug text-fg">{{ item.name }}</p>
          <p class="mt-1 truncate px-0.5 text-[11px] text-t3">{{ item.author }}</p>
          <div class="mt-1 flex items-center gap-2.5 px-0.5 text-[11px] text-t3">
            <span v-if="item.total != null" class="flex items-center gap-1">
              <Music :size="11" :stroke-width="2" />{{ item.total }}
            </span>
            <span v-if="item.time">{{ item.time }}</span>
            <span v-if="visibleSource" class="truncate">{{ item.source }}</span>
          </div>
        </button>
      </div>

      <UiPagination
        :count="props.listInfo.total"
        :limit="props.listInfo.limit"
        :page="props.listInfo.page"
        @btn-click="togglePage"
      />
    </div>

    <div v-if="props.listInfo.noItemLabel" class="absolute inset-0">
      <UiEmptyState :title="props.listInfo.noItemLabel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from '@common/utils/vueTools'
import { Headphones, Music } from 'lucide-vue-next'
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
