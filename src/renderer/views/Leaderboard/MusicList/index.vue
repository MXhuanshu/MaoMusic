<template>
  <div class="absolute inset-0">
    <UiOnlineList
      ref="listRef"
      :page="listDetailInfo.page"
      :limit="listDetailInfo.limit"
      :total="listDetailInfo.total"
      :list="listDetailInfo.list"
      :no-item="listDetailInfo.noItemLabel"
      @show-menu="hideListsMenu"
      @play-list="handlePlayList"
      @toggle-page="togglePage"
    />
  </div>
</template>

<script setup lang="ts">
import { watch } from '@common/utils/vueTools'
import UiOnlineList from '@renderer/ui/features/search/UiOnlineList.vue'
import useList from './useList'


const props = defineProps<{
  source: LX.OnlineSource
  boardId?: string
}>()

const emit = defineEmits(['show-menu'])

const {
  listRef,
  listDetailInfo,
  getList,
  handlePlayList,
} = useList()

watch(() => props.boardId, (boardId) => {
  if (!boardId) return
  getList(boardId, 1)
}, {
  immediate: true,
})


const hideListsMenu = () => {
  emit('show-menu')
}

const togglePage = (page: number) => {
  getList(listDetailInfo.id, page)
}

const hideMenu = () => {
  listRef.value?.handleMenuClick()
}

defineExpose({ hideMenu })
</script>
