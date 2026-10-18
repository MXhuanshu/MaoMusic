<template>
  <div class="relative flex h-full flex-col">
    <div class="flex shrink-0 items-center px-4 pt-2">
      <UiTabs v-model="activeTab" :list="tabs" />
    </div>

    <div class="mt-1 flex h-9 shrink-0 items-center gap-2 border-b border-line px-4 text-[11.5px] text-t3">
      <span class="w-8 shrink-0 text-center">#</span>
      <span class="min-w-0 flex-1">{{ $t('music_name') }}</span>
      <span class="w-[20%] shrink-0 truncate">{{ $t('download__progress') }}</span>
      <span class="w-[22%] shrink-0 truncate">{{ $t('download__status') }}</span>
      <span class="w-[10%] shrink-0">{{ $t('download__quality') }}</span>
      <span class="w-[112px] shrink-0" />
    </div>

    <div v-if="list.length" ref="dom_listContent" class="relative min-h-0 flex-1">
      <base-virtualized-list
        ref="listRef"
        v-slot="{ item, index }"
        :list="list"
        key-name="id"
        :item-height="listItemHeight"
        container-class="ui-scroll"
        content-class="relative"
      >
        <div
          class="group flex h-full cursor-default items-center gap-2 px-4 text-[12.5px] transition-colors duration-100"
          :class="[
            rightClickSelectedIndex == index ? 'bg-fill2' : 'hover:bg-fill',
            selectedList.includes(item) ? 'bg-accent/10' : '',
            playTaskId == item.id ? 'text-accent' : 'text-t2',
          ]"
          @click="handleListItemClick($event, index)"
          @contextmenu="handleListItemRightClick($event, index)"
        >
          <span class="no-select w-8 shrink-0 text-center text-[11px] tabular-nums text-t3" @click.stop>
            <Volume2 v-if="playTaskId == item.id" :size="13" :stroke-width="2" />
            <template v-else>{{ index + 1 }}</template>
          </span>

          <span class="select min-w-0 flex-1 truncate" :aria-label="getName(item)">{{ getName(item) }}</span>

          <span class="w-[20%] shrink-0 truncate text-[11.5px] text-t3">
            {{ item.progress }}%<span v-if="item.status == downloadStatus.RUN && item.speed"> - {{ item.speed }}/s</span>
          </span>
          <span class="w-[22%] shrink-0 truncate text-[11.5px] text-t3" :aria-label="item.statusText">{{ item.statusText }}</span>
          <span class="w-[10%] shrink-0 text-[11.5px] text-t3">{{ getTypeName(item.metadata.quality) }}</span>

          <span class="w-[112px] shrink-0 opacity-0 transition-opacity duration-100 group-hover:opacity-100">
            <UiListActions
              :index="index"
              :download-btn="false"
              :file-btn="item.status != downloadStatus.ERROR"
              :remove-btn="true"
              :start-btn="!item.isComplate && item.status != downloadStatus.WAITING && (item.status != downloadStatus.RUN)"
              :pause-btn="!item.isComplate && (item.status == downloadStatus.RUN || item.status == downloadStatus.WAITING)"
              :list-add-btn="false"
              :play-btn="item.status == downloadStatus.COMPLETED"
              :search-btn="item.status == downloadStatus.ERROR"
              @btn-click="handleListBtnClick"
            />
          </span>
        </div>
      </base-virtualized-list>
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

import { ref } from '@common/utils/vueTools'
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

import { Volume2 } from 'lucide-vue-next'
import UiContextMenu from '@renderer/ui/primitives/UiContextMenu.vue'
import UiEmptyState from '@renderer/ui/primitives/UiEmptyState.vue'
import UiListActions from '@renderer/ui/primitives/UiListActions.vue'
import UiTabs from '@renderer/ui/primitives/UiTabs.vue'
export default {
  name: 'Download',
  components: {
    UiContextMenu,
    UiEmptyState,
    UiListActions,
    Volume2,
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
