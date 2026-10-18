<template>
  <div class="relative flex h-full flex-col">
    <div class="flex shrink-0 items-center px-4 pt-2">
      <UiTabs v-model="activeTab" :list="tabs" />
    </div>

    <div v-if="list.length" ref="dom_listContent" class="relative min-h-0 flex-1">
      <UiSongWall
        ref="listRef"
        :list="list"
        :playing-index="playingIndex"
        :selected-list="selectedList"
        @item-click="handleListItemClick"
        @item-contextmenu="handleListItemRightClick"
      >
        <template #actions="slot">
          <UiListActions
            :index="Number(slot.index)"
            :download-btn="false"
            :file-btn="slot.item.status != downloadStatus.ERROR"
            :remove-btn="true"
            :start-btn="!slot.item.isComplate && slot.item.status != downloadStatus.WAITING && (slot.item.status != downloadStatus.RUN)"
            :pause-btn="!slot.item.isComplate && (slot.item.status == downloadStatus.RUN || slot.item.status == downloadStatus.WAITING)"
            :list-add-btn="false"
            :play-btn="slot.item.status == downloadStatus.COMPLETED"
            :search-btn="slot.item.status == downloadStatus.ERROR"
            @btn-click="handleListBtnClick"
          />
        </template>
      </UiSongWall>
    </div>

    <div v-else class="absolute inset-0 mt-8">
      <UiEmptyState :title="$t('no_item')" />
    </div>

    <UiContextMenu
      v-model="isShowItemMenu"
      :menus="menus"
      :xy="menuLocation"
      item-name="name"
      @menu-click="handleMenuClick"
    />

    <common-list-add-modal v-model:show="isShowListAdd" :music-info="selectedAddMusicInfo" teleport="#view" />
    <common-list-add-multiple-modal v-model:show="isShowListAddMultiple" :music-list="selectedList" teleport="#view" @confirm="removeAllSelect" />
  </div>
</template>
<script>
// import { checkPath, openDirInExplorer, openUrl } from '@common/utils/electron'

import { computed, ref } from '@common/utils/vueTools'
import useListInfo from './useListInfo'
import useList from './useList'
import useTab from './useTab'
import useMenu from './useMenu'
import usePlay from './usePlay'
import useTaskActions from './useTaskActions'
import useMusicAdd from './useMusicAdd'
import { downloadStatus } from '@renderer/store/download/state'
import { appSetting } from '@renderer/store/setting'
import { formatMusicName } from '@renderer/utils'

import UiContextMenu from '@renderer/ui/primitives/UiContextMenu.vue'
import UiEmptyState from '@renderer/ui/primitives/UiEmptyState.vue'
import UiListActions from '@renderer/ui/primitives/UiListActions.vue'
import UiSongWall from '@renderer/ui/primitives/UiSongWall.vue'
import UiTabs from '@renderer/ui/primitives/UiTabs.vue'
export default {
  name: 'Download',
  components: {
    UiContextMenu,
    UiEmptyState,
    UiListActions,
    UiSongWall,
    UiTabs,
  },
  setup() {
    const listRef = ref()
    const { tabs, activeTab } = useTab()

    const {
      rightClickSelectedIndex,
      dom_listContent,
      listAll,
      list,
      playTaskId,
    } = useListInfo(activeTab)

    const {
      selectedList,
      listItemHeight,
      removeAllSelect,
      handleSelectData,
    } = useList({ listRef, list, listAll })

    const playingIndex = computed(() => list.value.findIndex(item => item.id === playTaskId.value))

    const {
      handlePlayMusic,
      handlePlayMusicLater,
    } = usePlay({ selectedList, list, listAll, removeAllSelect })

    const {
      handleSearch,
      handleOpenMusicDetail,
      handleStartTask,
      handlePauseTask,
      handleRemoveTask,
      handleOpenFile,
    } = useTaskActions({ list, removeAllSelect, selectedList })

    const {
      isShowListAdd,
      isShowListAddMultiple,
      selectedAddMusicInfo,
      handleShowMusicAddModal,
    } = useMusicAdd({ selectedList, list })

    const {
      menus,
      menuLocation,
      isShowItemMenu,
      showMenu,
      menuClick,
    } = useMenu({
      handleStartTask,
      handlePauseTask,
      handleRemoveTask,
      handleOpenFile,
      handlePlayMusic,
      handlePlayMusicLater,
      handleShowMusicAddModal,
      handleSearch,
      handleOpenMusicDetail,
    })

    let clickTime = 0
    let clickIndex = -1
    const doubleClickPlay = index => {
      if (
        window.performance.now() - clickTime > 400 ||
      clickIndex !== index
      ) {
        clickTime = window.performance.now()
        clickIndex = index
        return
      }
      const task = list.value[index]
      if (task.isComplate) {
        handlePlayMusic(list.value.indexOf(task), true)
      } else if (task.status === downloadStatus.RUN || task.status === downloadStatus.WAITING) {
        void handlePauseTask(index, true)
      } else {
        void handleStartTask(index, true)
      }
      clickTime = 0
      clickIndex = -1
    }

    const handleListItemClick = (event, index) => {
      if (rightClickSelectedIndex.value > -1) return
      handleSelectData(index)
      doubleClickPlay(index)
    }
    const handleListItemRightClick = (event, index) => {
      rightClickSelectedIndex.value = index
      showMenu(event, list.value[index], index)
    }
    const handleMenuClick = (action) => {
      let index = rightClickSelectedIndex.value
      rightClickSelectedIndex.value = -1
      menuClick(action, index)
    }

    const handleListBtnClick = ({ action, index }) => {
      switch (action) {
        case 'play':
          handlePlayMusic(index, true)
          break
        case 'start':
          void handleStartTask(index, true)
          break
        case 'pause':
          void handlePauseTask(index, true)
          break
        case 'remove':
          void handleRemoveTask(index, true)
          break
        case 'file':
          void handleOpenFile(index)
          break
        case 'search':
          handleSearch(index)
          break
      }
    }

    const getName = (downloadInfo) => {
      return formatMusicName(appSetting['download.fileName'], downloadInfo.metadata.musicInfo.name, downloadInfo.metadata.musicInfo.singer)
    }
    const getTypeName = (quality) => {
      return quality == 'flac24bit' ? 'FLAC Hires' : quality?.toUpperCase()
    }
    return {
      listRef,
      list,
      downloadStatus,
      rightClickSelectedIndex,
      dom_listContent,
      tabs,
      activeTab,
      selectedList,
      listItemHeight,
      playingIndex,
      playTaskId,

      isShowListAdd,
      isShowListAddMultiple,
      selectedAddMusicInfo,

      removeAllSelect,

      menus,
      menuLocation,
      isShowItemMenu,

      handleListItemClick,
      handleListItemRightClick,
      handleMenuClick,
      handleListBtnClick,

      getName,
      getTypeName,
    }
  },
}
</script>
