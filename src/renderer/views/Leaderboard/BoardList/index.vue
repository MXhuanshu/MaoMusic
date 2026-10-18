<template>
  <ul ref="dom_lists_list" class="ui-scroll h-full overflow-y-auto py-1">
    <li
      v-for="(item, index) in list"
      :key="item.id"
      class="mx-2 flex h-9 cursor-default items-center rounded-[8px] px-2.5 text-[12.5px] transition-colors duration-100"
      :class="[
        item.id == boardId ? 'bg-fill2 font-medium text-fg' : 'text-t2 hover:bg-fill hover:text-fg',
        rightClickItemIndex == index ? 'bg-fill2' : '',
      ]"
      :aria-label="item.name"
      @click="handleToggleList(item.id)"
      @contextmenu="handleRigthClick($event, index)"
    >
      <span class="truncate">{{ item.name }}</span>
    </li>
  </ul>

  <UiContextMenu
    v-model="isShowMenu"
    :menus="menus"
    :xy="menuLocation"
    item-name="name"
    @menu-click="handleMenuClick"
  />
</template>

<script setup>
import { watch, shallowReactive, ref } from '@common/utils/vueTools'
import { getBoardsList, setBoard } from '@renderer/store/leaderboard/action'
import { boards } from '@renderer/store/leaderboard/state'
import useMenu from './useMenu'
import { useRouter, useRoute } from '@common/utils/vueRouter'
import UiContextMenu from '@renderer/ui/primitives/UiContextMenu.vue'

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
  boardId: {
    type: [String, undefined],
    default: undefined,
  },
})

const emit = defineEmits(['show-menu'])

const router = useRouter()
const route = useRoute()

const list = shallowReactive([])
const rightClickItemIndex = ref(-1)

const handleToggleList = (id) => {
  void router.replace({
    path: route.path,
    query: {
      source: props.source,
      boardId: id,
    },
  })
}

const {
  menus,
  menuLocation,
  isShowMenu,
  showMenu,
  menuClick,
} = useMenu({ emit, list })

const handleRigthClick = (event, index) => {
  rightClickItemIndex.value = index
  showMenu(event, index)
}
const handleMenuClick = (action) => {
  if (rightClickItemIndex.value < 0) return
  let index = rightClickItemIndex.value
  rightClickItemIndex.value = -1
  menuClick(action, index, props.source)
}

watch(() => props.source, async(source) => {
  let boardList = boards[source]
  if (boardList == null) setBoard(boardList = await getBoardsList(source), source)
  list.splice(0, list.length, ...boardList.list)
  if (!props.boardId && boardList.list.length) handleToggleList(boardList.list[0].id)
}, {
  immediate: true,
})

defineExpose({ hideMenu: handleMenuClick })
</script>
