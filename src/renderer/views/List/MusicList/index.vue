<template>
  <div class="relative flex h-full flex-col">
    <!-- 表头 -->
    <div class="flex h-9 shrink-0 items-center gap-2 border-b border-line px-3 text-[11.5px] text-t3">
      <span class="w-8 shrink-0 text-center">#</span>
      <span class="min-w-0 flex-1">{{ $t('music_name') }}</span>
      <span class="shrink-0 truncate" :class="actionButtonsVisible ? 'w-[22%]' : 'w-[25%]'">{{ $t('music_singer') }}</span>
      <span class="shrink-0 truncate" :class="actionButtonsVisible ? 'w-[22%]' : 'w-[28%]'">{{ $t('music_album') }}</span>
      <span class="w-12 shrink-0 text-right">{{ $t('music_time') }}</span>
      <span v-if="actionButtonsVisible" class="w-[104px] shrink-0" />
    </div>

    <div v-show="list.length" ref="dom_listContent" class="relative min-h-0 flex-1">
      <base-virtualized-list
        ref="listRef"
        v-slot="{ item, index }"
        :list="list"
        key-name="id"
        :item-height="listItemHeight"
        container-class="ui-scroll"
        content-class="relative"
        @scroll="saveListPosition"
        @contextmenu.capture="handleListRightClick"
      >
        <div
          class="group flex h-full cursor-default items-center gap-2 px-3 text-[12.5px] transition-colors duration-100"
          :class="[
            selectedIndex == index || rightClickSelectedIndex == index ? 'bg-fill2' : 'hover:bg-fill',
            selectedList.includes(item) ? 'bg-accent/10' : '',
            playerInfo.isPlayList && playerInfo.playIndex === index ? 'text-accent' : 'text-t2',
          ]"
          @click="handleListItemClick($event, index)"
          @contextmenu="handleListItemRightClick($event, index)"
        >
          <span class="no-select w-8 shrink-0 text-center text-[11px] tabular-nums text-t3" @click.stop>
            <Volume2 v-if="playerInfo.isPlayList && playerInfo.playIndex === index" :size="13" :stroke-width="2" />
            <template v-else>{{ index + 1 }}</template>
          </span>

          <div class="flex min-w-0 flex-1 items-center gap-1.5">
            <span class="select truncate" :aria-label="item.name">{{ item.name }}</span>
            <span v-if="isShowSource" class="no-select shrink-0 rounded bg-fill2 px-1 text-[10px] leading-none text-t3">{{ item.source }}</span>
          </div>

          <span class="shrink-0 truncate text-t3" :class="actionButtonsVisible ? 'w-[22%]' : 'w-[25%]'">
            <span class="select" :aria-label="item.singer">{{ item.singer }}</span>
          </span>
          <span class="shrink-0 truncate text-t3" :class="actionButtonsVisible ? 'w-[22%]' : 'w-[28%]'">
            <span class="select" :aria-label="item.meta.albumName">{{ item.meta.albumName }}</span>
          </span>
          <span class="w-12 shrink-0 text-right text-[11.5px] tabular-nums text-t3">{{ item.interval || '--/--' }}</span>

          <span v-if="actionButtonsVisible" class="w-[104px] shrink-0 opacity-0 transition-opacity duration-100 group-hover:opacity-100">
            <UiListActions
              :index="index"
              :download-btn="assertApiSupport(item.source) && item.source != 'local'"
              @btn-click="handleListBtnClick"
            />
          </span>
        </div>
      </base-virtualized-list>
    </div>
    <div v-show="!list.length" class="absolute inset-0">
      <UiEmptyState :title="$t('no_item')" />
    </div>
    <common-list-add-modal
      v-model:show="isShowListAdd" :is-move="isMove" :from-list-id="listId"
      :music-info="selectedAddMusicInfo" :exclude-list-id="excludeListIds" teleport="#view"
    />
    <common-list-add-multiple-modal
      v-model:show="isShowListAddMultiple" :from-list-id="listId"
      :is-move="isMoveMultiple" :music-list="selectedList" :exclude-list-id="excludeListIds" teleport="#view" @confirm="removeAllSelect"
    />
    <common-download-modal v-model:show="isShowDownload" :music-info="selectedDownloadMusicInfo" teleport="#view" :list-id="listId" />
    <common-download-multiple-modal v-model:show="isShowDownloadMultiple" :list="selectedList" teleport="#view" :list-id="listId" @confirm="removeAllSelect" />
    <search-list :list="list" :visible="isShowSearchBar" @action="handleMusicSearchAction" />
    <music-sort-modal v-model:show="isShowMusicSortModal" :music-info="selectedSortMusicInfo" :selected-num="selectedNum" @confirm="sortMusic" />
    <music-toggle-modal v-model:show="isShowMusicToggleModal" :music-info="selectedToggleMusicInfo" @toggle="toggleSource" />
    <UiContextMenu v-model="isShowItemMenu" :menus="menus" :xy="menuLocation" item-name="name" @menu-click="handleMenuClick" />
  </div>
</template>

<script>
import { clipboardWriteText } from '@common/utils/electron'
import { assertApiSupport } from '@renderer/store/utils'
import SearchList from './components/SearchList.vue'
import MusicSortModal from './components/MusicSortModal.vue'
import MusicToggleModal from './components/MusicToggleModal.vue'
import { Volume2 } from 'lucide-vue-next'
import UiContextMenu from '@renderer/ui/primitives/UiContextMenu.vue'
import UiListActions from '@renderer/ui/primitives/UiListActions.vue'
import UiEmptyState from '@renderer/ui/primitives/UiEmptyState.vue'
import useListInfo from './useListInfo'
import useList from './useList'
import useMenu from './useMenu'
import usePlay from './usePlay'
import useMusicDownload from './useMusicDownload'
import useMusicAdd from './useMusicAdd'
import useSort from './useSort'
import useMusicActions from './useMusicActions'
import useSearch from './useSearch'
import useListScroll from './useListScroll'
import useMusicToggle from './useMusicToggle'
import { appSetting } from '@renderer/store/setting'
export default {
  name: 'MusicList',
  components: {
    UiContextMenu,
    UiListActions,
    UiEmptyState,
    Volume2,
    SearchList,
    MusicSortModal,
    MusicToggleModal,
  },
  props: {
    listId: {
      type: String,
      required: true,
    },
  },
  emits: ['show-menu'],
  setup(props, { emit }) {
    const actionButtonsVisible = appSetting['list.actionButtonsVisible']

    let scrollIndex = null
    let isAnimation = false
    const handleRestoreScroll = (_scrollIndex, _isAnimation) => {
      scrollIndex = _scrollIndex
      isAnimation = _isAnimation
      if (isAnimation) void restoreScroll(scrollIndex, isAnimation)
      // console.log('handleRestoreScroll', scrollIndex, isAnimation)
    }
    const onLoadedList = () => {
      // console.log('restoreScroll', scrollIndex, isAnimation)
      void restoreScroll(scrollIndex, isAnimation)
    }

    const {
      rightClickSelectedIndex,
      selectedIndex,
      dom_listContent,
      listRef,
      list,
      playerInfo,
      setSelectedIndex,
      isShowSource,
      excludeListIds,
    } = useListInfo({ props, onLoadedList })

    const {
      selectedList,
      listItemHeight,
      handleSelectData,
      removeAllSelect,
    } = useList({ listRef, list })

    const {
      handlePlayMusic,
      handlePlayMusicLater,
      doubleClickPlay,
    } = usePlay({ props, selectedList, list, removeAllSelect })

    const {
      isShowListAdd,
      isMove,
      isShowListAddMultiple,
      isMoveMultiple,
      selectedAddMusicInfo,
      handleShowMusicAddModal,
      handleShowMusicMoveModal,
    } = useMusicAdd({ selectedList, list })

    const {
      isShowDownload,
      isShowDownloadMultiple,
      selectedDownloadMusicInfo,
      handleShowDownloadModal,
    } = useMusicDownload({ selectedList, list })

    const {
      isShowMusicSortModal,
      selectedNum,
      selectedSortMusicInfo,
      handleShowSortModal,
      sortMusic,
    } = useSort({ props, list, selectedList, removeAllSelect })

    const {
      handleShowMusicToggleModal,
      isShowMusicToggleModal,
      selectedToggleMusicInfo,
      toggleSource,
    } = useMusicToggle(props, list)

    const {
      handleSearch,
      handleOpenMusicDetail,
      handleCopyName,
      handleDislikeMusic,
      handleRemoveMusic,
    } = useMusicActions({ props, list, removeAllSelect, selectedList })

    const {
      menus,
      menuLocation,
      isShowItemMenu,
      showMenu,
      menuClick,
    } = useMenu({
      assertApiSupport,
      emit,

      handleShowDownloadModal,
      handlePlayMusic,
      handlePlayMusicLater,
      handleShowMusicToggleModal,
      handleSearch,
      handleShowMusicAddModal,
      handleShowMusicMoveModal,
      handleShowSortModal,
      handleOpenMusicDetail,
      handleCopyName,
      handleDislikeMusic,
      handleRemoveMusic,
    })

    const {
      isShowSearchBar,
      searchList,
      handleMusicSearchAction,
    } = useSearch({
      setSelectedIndex,
      handlePlayMusic,
      listRef,
    })

    const { saveListPosition, restoreScroll } = useListScroll({ props, listRef, list, handleRestoreScroll })


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
    const handleListRightClick = (event) => {
      if (!event.target.classList.contains('select')) return
      event.stopImmediatePropagation()
      let classList = dom_listContent.value.classList
      classList.add('copying')
      window.requestAnimationFrame(() => {
        let str = window.getSelection().toString()
        classList.remove('copying')
        str = str.split(/\n\n/).map(s => s.replace(/\n/g, '  ')).join('\n').trim()
        if (!str.length) return
        clipboardWriteText(str)
      })
    }
    const handleListBtnClick = ({ action, index }) => {
      switch (action) {
        case 'download':
          handleShowDownloadModal(index, true)
          break
        case 'play':
          handlePlayMusic(index, true)
          break
        case 'search':
          handleSearch(index)
          break
        case 'listAdd':
          handleShowMusicAddModal(index, true)
          break
      }
    }
    const scrollToTop = () => {
      listRef.value.scrollTo(0, true)
    }

    return {
      listItemHeight,
      handleListItemClick,
      selectedList,
      handleListItemRightClick,
      removeAllSelect,
      handleListBtnClick,
      rightClickSelectedIndex,
      selectedIndex,
      dom_listContent,
      listRef,
      excludeListIds,

      menus,
      isShowItemMenu,
      menuLocation,
      handleMenuClick,

      handleListRightClick,
      assertApiSupport,

      isShowListAdd,
      isMove,
      isShowListAddMultiple,
      isMoveMultiple,
      selectedAddMusicInfo,

      isShowMusicSortModal,
      selectedNum,
      selectedSortMusicInfo,
      sortMusic,

      isShowDownload,
      isShowDownloadMultiple,
      selectedDownloadMusicInfo,

      scrollToTop,

      isShowSearchBar,
      searchList,
      handleMusicSearchAction,

      list,
      playerInfo,

      saveListPosition,
      isShowSource,
      handleRestoreScroll,

      actionButtonsVisible,

      isShowMusicToggleModal,
      selectedToggleMusicInfo,
      toggleSource,
    }
  },
}
</script>

