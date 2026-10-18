<template>
  <div class="relative flex h-full flex-col overflow-hidden">
    <!-- 表头 -->
    <div class="flex h-9 shrink-0 items-center gap-2 border-b border-line px-3 text-[11.5px] text-t3">
      <span class="w-8 shrink-0 text-center">#</span>
      <span class="min-w-0 flex-1">{{ $t('music_name') }}</span>
      <span class="w-[22%] shrink-0 truncate">{{ $t('music_singer') }}</span>
      <span class="w-[22%] shrink-0 truncate">{{ $t('music_album') }}</span>
      <span class="w-12 shrink-0 text-right">{{ $t('music_time') }}</span>
      <span v-if="actionButtonsVisible" class="w-[104px] shrink-0" />
    </div>

    <!-- 列表 -->
    <div ref="dom_listContent" class="relative min-h-0 flex-1">
      <base-virtualized-list
        v-show="!noItem"
        ref="listRef"
        :list="list"
        key-name="id"
        :item-height="listItemHeight"
        container-class="ui-scroll"
        content-class="relative"
        @contextmenu.capture="handleListRightClick"
      >
        <template #default="{ item, index }: { item: any, index: number }">
          <div
            class="group flex h-full cursor-default items-center gap-2 px-3 text-[12.5px] transition-colors duration-100"
            :class="[
              rightClickSelectedIndex === index ? 'bg-fill2' : 'hover:bg-fill',
              selectedList.includes(item) ? 'bg-accent/10' : '',
              isCurrent(item) ? 'text-accent' : 'text-t2',
            ]"
            @click="handleListItemClick($event, index)"
            @contextmenu="handleListItemRightClick($event, index)"
          >
            <span class="no-select w-8 shrink-0 text-center text-[11px] tabular-nums text-t3" @click.stop>{{ index + 1 }}</span>

            <div class="flex min-w-0 flex-1 items-center gap-1.5">
              <span class="select truncate" :aria-label="item.name">{{ item.name }}</span>
              <span
                v-if="item.meta._qualitys.flac24bit"
                class="no-select shrink-0 rounded bg-accent/15 px-1 py-px text-[10px] leading-none text-accent"
              >{{ $t('tag__lossless_24bit') }}</span>
              <span
                v-else-if="item.meta._qualitys.ape || item.meta._qualitys.flac || item.meta._qualitys.wav"
                class="no-select shrink-0 rounded bg-accent/15 px-1 py-px text-[10px] leading-none text-accent"
              >{{ $t('tag__lossless') }}</span>
              <span
                v-else-if="item.meta._qualitys['320k']"
                class="no-select shrink-0 rounded bg-fill2 px-1 py-px text-[10px] leading-none text-t2"
              >{{ $t('tag__high_quality') }}</span>
              <span
                v-if="sourceTag"
                class="no-select shrink-0 rounded bg-fill2 px-1 py-px text-[10px] leading-none text-t3"
              >{{ item.source }}</span>
            </div>

            <span class="w-[22%] shrink-0 truncate text-t3"><span class="select" :aria-label="item.singer">{{ item.singer }}</span></span>
            <span class="w-[22%] shrink-0 truncate text-t3"><span class="select" :aria-label="item.meta.albumName">{{ item.meta.albumName }}</span></span>
            <span class="w-12 shrink-0 text-right text-[11.5px] tabular-nums text-t3">{{ item.interval || '--/--' }}</span>

            <span
              v-if="actionButtonsVisible"
              class="w-[104px] shrink-0 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
            >
              <UiListActions
                :index="index"
                :remove-btn="false"
                :download-btn="assertApiSupport(item.source)"
                :play-btn="checkApiSource ? assertApiSupport(item.source) : true"
                @btn-click="handleListBtnClick"
              />
            </span>
          </div>
        </template>

        <template #footer>
          <UiPagination
            :count="total"
            :limit="limit"
            :page="page"
            @btn-click="$emit('togglePage', $event)"
          />
        </template>
      </base-virtualized-list>

      <div v-if="noItem" class="absolute inset-0">
        <UiEmptyState :title="noItem" />
      </div>
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
import { ref } from '@common/utils/vueTools'
import { clipboardWriteText } from '@common/utils/electron'
import { assertApiSupport } from '@renderer/store/utils'
import { musicInfo } from '@renderer/store/player/state'
import { appSetting } from '@renderer/store/setting'

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

const actionButtonsVisible = appSetting['list.actionButtonsVisible']
const rightClickSelectedIndex = ref(-1)
const dom_listContent = ref<HTMLElement | null>(null)
const listRef = ref<any>(null)

const {
  selectedList,
  listItemHeight,
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
const isCurrent = (item: LX.Music.MusicInfoOnline) => !!musicInfo.id && musicInfo.id === item.id

const handleListItemClick = (event: MouseEvent, index: number) => {
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

/** 右键选中文字 → 复制整行（与旧列表一致） */
const handleListRightClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.classList.contains('select')) return
  event.stopImmediatePropagation()
  const classList = dom_listContent.value?.classList
  classList?.add('copying')
  window.requestAnimationFrame(() => {
    let str = window.getSelection()?.toString() ?? ''
    classList?.remove('copying')
    str = str.split(/\n\n/).map(s => s.replace(/\n/g, '  ')).join('\n').trim()
    if (!str.length) return
    clipboardWriteText(str)
  })
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
  scrollToTop: () => listRef.value?.scrollTo(0, true),
  /** 与旧 material-online-list 的接口保持一致：外部（如排行榜）用来互斥关闭右键菜单 */
  handleMenuClick: () => {
    isShowItemMenu.value = false
    rightClickSelectedIndex.value = -1
  },
})
</script>
