<template>
  <div class="absolute inset-0">
    <UiOnlineList
      ref="listRef"
      :page="listInfo.page"
      :limit="listInfo.limit"
      :total="listInfo.total"
      :list="listInfo.list"
      :no-item="listInfo.noItemLabel"
      :source-tag="sourceId === 'all'"
      check-api-source
      @toggle-page="handleTogglePage"
      @play-list="handlePlayList"
    />
  </div>
</template>

<script setup lang="ts">
import { watch } from '@common/utils/vueTools'
import { searchText } from '@renderer/store/search/state'
import { useRoute, useRouter } from '@common/utils/vueRouter'
import UiOnlineList from '@renderer/ui/features/search/UiOnlineList.vue'
import useList, { type SearchSource } from './useList'

interface Props {
  sourceId: SearchSource
  page: number
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()

const {
  listRef,
  listInfo,
  search,
  handlePlayList,
} = useList()

watch(() => [props.sourceId, props.page], ([sourceId, page]) => {
  setTimeout(() => {
    search(searchText.value, sourceId as SearchSource, (page as number) || 1)
  })
})
watch(searchText, (text) => {
  setTimeout(() => {
    search(text, props.sourceId, props.page)
  })
}, {
  immediate: true,
})

const handleTogglePage = (page: number) => {
  void router.replace({
    path: route.path,
    query: {
      ...route.query,
      page,
    },
  })
}
</script>
