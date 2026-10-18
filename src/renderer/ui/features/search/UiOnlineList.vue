<template>
  <div class="relative h-full overflow-hidden">
    <UiSongWall
      ref="listRef"
      :list="list"
      :playing-index="currentIndex"
      :selected-list="selectedList"
      :source-tag="sourceTag"
      @item-click="handleListItemClick"
      @item-contextmenu="handleListItemRightClick"
      @list-contextmenu="handleListRightClick"
    >
      <template #actions="{ item, index }: { item: any, index: number }">
        <UiListActions
          :index="index"
          :remove-btn="false"
          :download-btn="assertApiSupport(item.source)"
          :play-btn="checkApiSource ? assertApiSupport(item.source) : true"
          @btn-click="handleListBtnClick"
        />
      </template>
      <template #footer>
        <div class="flex justify-center py-3">
          <UiPagination
            :count="total"
            :limit="limit"
            :page="page"
            @btn-click="$emit('togglePage', $event)"
          />
        </div>
      </template>
    </UiSongWall>

    <div v-if="noItem" class="absolute inset-0">
      <UiEmptyState :title="noItem" />
    </div>

    <common-list-add-modal v-model:show="isShowListAdd" :music-info="selectedAddMusicInfo" teleport="#view" />
    <common-list-add-multiple-modal v-model:show="isShowListAddMultiple" :music-list="selectedList" teleport="#view" @confirm="removeAllSelect" />
    <common-download-modal v-model:show="isShowDownload" :music-info="selectedDownloadMusicInfo" teleport="#view" />
    <common-download-multiple-modal v-model:show="isShowDownloadMultiple" :list="selectedList" teleport="#view" @confirm="removeAllSelect" />

    <UiContextMenu
      v-model="isShowItemMenu"
      :menus="menus"
      :xy="menuLocation"
      item-name="name"
      @menu-click="handleMenuClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from '@common/utils/vueTools'
import { clipboardWriteText } from '@common/utils/electron'
import { assertApiSupport } from '@renderer/store/utils'
import { musicInfo } from '@renderer/store/player/state'

import useList from '@renderer/components/material/OnlineList/useList'
import useMenu from '@renderer/components/material/OnlineList/useMenu'
import usePlay from '@renderer/components/material/OnlineList/usePlay'
import useMusicDownload from '@renderer/components/material/OnlineList/useMusicDownload'
import useMusicAdd from '@renderer/components/material/OnlineList/useMusicAdd'
import useMusicActions from '@renderer/components/material/OnlineList/useMusicActions'

import UiContextMenu from '../../primitives/UiContextMenu.vue'
import UiEmptyState from '../../primitives/UiEmptyState.vue'
import UiListActions from '../../primitives/UiListActions.vue'
import UiPagination from '../../primitives/UiPagination.vue'
import UiSongWall from '../../primitives/UiSongWall.vue'

interface Props {
  list: LX.Music.MusicInfoOnline[]
  page: number
  limit: number
  total: number
  sourceTag?: boolean
  noItem?: string
  checkApiSource?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sourceTag: false,
  noItem: '',
  checkApiSource: false,
})

const emit = defineEmits<{
  'show-menu': []
  'play-list': [index: number]
  togglePage: [page: number]
}>()

const rightClickSelectedIndex = ref(-1)
const listRef = ref<any>(null)

const {
  selectedList,
  handleSelectData,
  removeAllSelect,
} = useList({ props, listRef })

const {
  handlePlayMusic,
  handlePlayMusicLater,
  doubleClickPlay,
} = usePlay({ selectedList, props, removeAllSelect, emit })

const {
  isShowListAdd,
  isShowListAddMultiple,
  selectedAddMusicInfo,
  handleShowMusicAddModal,
} = useMusicAdd({ selectedList, props })

const {
  isShowDownload,
  isShowDownloadMultiple,
  selectedDownloadMusicInfo,
  handleShowDownloadModal,
} = useMusicDownload({ selectedList, props })

const {
  handleSearch,
  handleOpenMusicDetail,
  handleDislikeMusic,
} = useMusicActions({ props })

const {
  menus,
  menuLocation,
  isShowItemMenu,
  showMenu,
  menuClick,
} = useMenu({
  props,
  assertApiSupport,
  emit,
  handleShowDownloadModal,
  handlePlayMusic,
  handlePlayMusicLater,
  handleSearch,
  handleShowMusicAddModal,
  handleOpenMusicDetail,
  handleDislikeMusic,
})

/** 正在播放的那首：只比 id，避免整对象比较 */
const currentIndex = computed(() => {
  if (!musicInfo.id) return -1
  return props.list.findIndex((item: LX.Music.MusicInfoOnline) => item.id === musicInfo.id)
})

const handleListItemClick = (_event: MouseEvent, index: number) => {
  if (rightClickSelectedIndex.value > -1) return
  handleSelectData(index)
  doubleClickPlay(index)
}

const handleListItemRightClick = (event: MouseEvent, index: number) => {
  rightClickSelectedIndex.value = index
  showMenu(event, props.list[index])
}

const handleMenuClick = (action: { action: string } | null) => {
  const index = rightClickSelectedIndex.value
  rightClickSelectedIndex.value = -1
  if (!action) return
  menuClick(action, index)
}

/** 右键选中文字 → 复制（保留旧列表的行为） */
const handleListRightClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.classList.contains('select')) return
  event.stopImmediatePropagation()
  let str = window.getSelection()?.toString() ?? ''
  str = str.split(/\n\n/).map(s => s.replace(/\n/g, '  ')).join('\n').trim()
  if (!str.length) return
  clipboardWriteText(str)
}

const handleListBtnClick = ({ action, index }: { action: string, index: number }) => {
  switch (action) {
    case 'download':
      handleShowDownloadModal(index, true)
      break
    case 'play':
      void handlePlayMusic(index, true)
      break
    case 'search':
      handleSearch(index)
      break
    case 'listAdd':
      handleShowMusicAddModal(index, true)
      break
  }
}

defineExpose({
  scrollToTop: () => listRef.value?.scrollTo(0),
  handleMenuClick: () => {
    isShowItemMenu.value = false
    rightClickSelectedIndex.value = -1
  },
})
</script>
