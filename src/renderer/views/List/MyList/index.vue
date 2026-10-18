<template>
  <div class="relative flex h-full flex-col">
    <!-- 标题 + 新建/同步云歌单 -->
    <div class="flex h-12 shrink-0 items-center justify-between pr-2 pl-3">
      <h2 class="text-[13px] font-medium text-fg">{{ $t('my_list') }}</h2>
      <div class="flex items-center gap-0.5">
        <button
          type="button"
          class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
          :aria-label="$t('lists__new_list_btn')"
          @click="isShowNewList = true"
        >
          <Plus :size="15" :stroke-width="2" />
        </button>
        <button
          type="button"
          class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
          :aria-label="$t('list_update_modal__title')"
          @click="isShowListUpdateModal = true"
        >
          <RefreshCw :size="14" :stroke-width="2" />
        </button>
      </div>
    </div>

    <!-- 收藏 / 默认 / 自建列表 -->
    <ul
      ref="dom_lists_list"
      class="ui-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-1"
      :class="isModDown ? 'cursor-grab' : ''"
    >
      <li
        class="default-list"
        :class="[
          'flex h-9 items-center rounded-[8px] px-2.5 text-[12.5px] transition-colors duration-100',
          defaultList.id == listId ? 'bg-fill2 font-medium text-fg' : 'text-t2 hover:bg-fill hover:text-fg',
          rightClickItemIndex == -2 ? 'bg-fill2' : '',
        ]"
        :aria-label="$t(defaultList.name)"
        :aria-selected="defaultList.id == listId"
        @contextmenu="handleListsItemRigthClick($event, -2)"
        @click="handleListToggle(defaultList.id)"
      >
        <span class="truncate">{{ $t(defaultList.name) }}</span>
      </li>

      <li
        class="default-list"
        :class="[
          'flex h-9 items-center rounded-[8px] px-2.5 text-[12.5px] transition-colors duration-100',
          loveList.id == listId ? 'bg-fill2 font-medium text-fg' : 'text-t2 hover:bg-fill hover:text-fg',
          rightClickItemIndex == -1 ? 'bg-fill2' : '',
        ]"
        :aria-label="$t(loveList.name)"
        :aria-selected="loveList.id == listId"
        @contextmenu="handleListsItemRigthClick($event, -1)"
        @click="handleListToggle(loveList.id)"
      >
        <span class="truncate">{{ $t(loveList.name) }}</span>
      </li>

      <li
        v-for="(item, index) in userLists"
        :key="item.id"
        class="user-list"
        :class="[
          'flex h-9 items-center rounded-[8px] px-2.5 text-[12.5px] transition-colors duration-100',
          item.id == listId ? 'bg-fill2 font-medium text-fg' : 'text-t2 hover:bg-fill hover:text-fg',
          rightClickItemIndex == index ? 'bg-fill2' : '',
        ]"
        :data-index="index"
        :aria-label="item.name"
        @contextmenu="handleListsItemRigthClick($event, index)"
      >
        <span class="truncate" @click="handleListToggle(item.id, index + 2)">{{ item.name }}</span>
        <base-input
          class="ml-2 min-w-0 flex-1 text-[12.5px]"
          type="text"
          :value="item.name"
          :placeholder="item.name"
          @keyup.enter="handleSaveListName(index, $event)"
          @blur="handleSaveListName(index, $event)"
        />
      </li>

      <li v-if="isShowNewList" class="flex h-9 items-center rounded-[8px] px-2.5">
        <base-input
          ref="dom_listsNewInput"
          class="min-w-0 flex-1 text-[12.5px]"
          type="text"
          :placeholder="$t('lists__new_list_input')"
          @keyup.enter="handleCreateList"
          @blur="handleCreateList"
        />
      </li>
    </ul>

    <UiContextMenu
      v-model="isShowMenu"
      :menus="menus"
      :xy="menuLocation"
      item-name="name"
      @menu-click="handleMenuClick"
    />
    <DuplicateMusicModal v-model:visible="isShowDuplicateMusicModal" :list-info="duplicateListInfo" />
    <ListSortModal v-model:visible="isShowListSortModal" :list-info="sortListInfo" />
    <ListUpdateModal v-model:visible="isShowListUpdateModal" />
  </div>
</template>

<script>
import { openUrl } from '@common/utils/electron'
import { Plus, RefreshCw } from 'lucide-vue-next'

import musicSdk from '@renderer/utils/musicSdk'
import DuplicateMusicModal from './components/DuplicateMusicModal.vue'
import ListSortModal from './components/ListSortModal.vue'
import ListUpdateModal from './components/ListUpdateModal.vue'
import UiContextMenu from '@renderer/ui/primitives/UiContextMenu.vue'

import { defaultList, loveList, userLists, fetchingListStatus } from '@renderer/store/list/state'
import { removeUserList } from '@renderer/store/list/action'

import { ref, watch } from '@common/utils/vueTools'
import { useRouter } from '@common/utils/vueRouter'
import { LIST_IDS } from '@common/constants'

import { dialog } from '@renderer/plugins/Dialog'

import { saveListPrevSelectId } from '@renderer/utils/data'

import { useI18n } from '@renderer/plugins/i18n'


import useShare from './useShare'
import useMenu from './useMenu'
import useListUpdate from './useListUpdate'
import useSort from './useSort'
import useDarg from './useDarg'
import useEditList from './useEditList'
import useListScroll from './useListScroll'
import useDuplicate from './useDuplicate'

export default {
  name: 'MyLists',
  components: {
    DuplicateMusicModal,
    ListSortModal,
    ListUpdateModal,
    UiContextMenu,
    Plus,
    RefreshCw,
  },
  props: {
    listId: {
      type: String,
      required: true,
    },
  },
  emits: ['show-menu'],
  setup(props, { emit }) {
    const router = useRouter()
    const t = useI18n()

    const dom_lists_list = ref(null)
    const rightClickItemIndex = ref(-10)

    const { handleImportList, handleExportList } = useShare()
    const { isShowListUpdateModal, handleUpdateSourceList } = useListUpdate()
    const { isShowListSortModal, sortListInfo, handleSortList } = useSort()
    const { isShowDuplicateMusicModal, duplicateListInfo, handleDuplicateList } = useDuplicate()
    const { handleRename, handleSaveListName, isShowNewList, isNewListLeave, handleCreateList } = useEditList({ dom_lists_list })
    useListScroll({ dom_lists_list })

    const handleOpenSourceDetailPage = async(listInfo) => {
      const { source, sourceListId } = listInfo
      if (!sourceListId) return
      let url
      if (/board__/.test(sourceListId)) {
        const id = sourceListId.replace(/board__/, '')
        url = musicSdk[source].leaderboard.getDetailPageUrl(id)
      } else if (musicSdk[source]?.songList?.getDetailPageUrl) {
        url = await musicSdk[source].songList.getDetailPageUrl(sourceListId)
      }
      if (!url) return
      void openUrl(url)
    }

    const handleRemove = (listInfo) => {
      void dialog.confirm({
        message: t('lists__remove_tip', { name: listInfo.name }),
        confirmButtonText: t('lists__remove_tip_button'),
      }).then(isRemove => {
        if (!isRemove) return
        void removeUserList([listInfo.id])
        if (props.listId == listInfo.id) {
          handleListToggle(LIST_IDS.DEFAULT)
        }
      })
    }

    const {
      menus,
      menuLocation,
      isShowMenu,
      showMenu,
      menuClick,
    } = useMenu({
      emit,

      handleImportList,
      handleExportList,
      handleUpdateSourceList,
      handleOpenSourceDetailPage,
      handleSortList,
      handleDuplicateList,
      handleRename,
      handleRemove,
    })

    const handleListsItemRigthClick = (event, index) => {
      rightClickItemIndex.value = index
      showMenu(event, index)
    }

    const handleListToggle = (id) => {
      if (id == props.listId) return
      router.replace({
        path: '/list',
        query: { id },
      }).catch(_ => _)
    }

    const handleMenuClick = (action) => {
      if (rightClickItemIndex.value < -2) return
      let index = rightClickItemIndex.value
      rightClickItemIndex.value = -10
      menuClick(action, index)
    }

    const { isModDown } = useDarg({ dom_lists_list, handleMenuClick, handleSaveListName })


    watch(() => props.listId, (listId) => {
      saveListPrevSelectId(listId)
    })

    watch(() => userLists, (lists) => {
      if (lists.some(l => l.id == props.listId)) return
      void router.replace({
        path: '/list',
        query: {
          id: defaultList.id,
        },
      })
    })

    return {
      rightClickItemIndex,
      defaultList,
      loveList,
      userLists,
      fetchingListStatus,
      dom_lists_list,
      isShowListUpdateModal,
      isShowListSortModal,
      sortListInfo,
      isShowDuplicateMusicModal,
      duplicateListInfo,
      handleSaveListName,
      isShowNewList,
      isNewListLeave,
      handleCreateList,
      handleListsItemRigthClick,
      isShowMenu,
      handleMenuClick,
      menus,
      menuLocation,
      handleListToggle,
      isModDown,
    }
  },
}
</script>
