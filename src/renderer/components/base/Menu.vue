<template>
  <teleport to="#root">
    <ul
      ref="dom_menu"
      class="absolute z-10 overflow-hidden rounded-[12px] bg-menu text-[12px] text-fg shadow-[0_2px_14px_rgba(0,0,0,.35)] ring-1 ring-line"
      :style="menuStyles"
      role="toolbar"
      :aria-hidden="!modelValue"
    >
      <li
        v-for="item in menus"
        v-show="!item.hide && (item.action == 'download' ? appSetting['download.enable'] : true)"
        :key="item.action"
        class="min-w-[96px] cursor-pointer truncate px-2.5 text-center leading-[34px] outline-none transition-colors duration-150 ease-ui hover:bg-fill active:bg-raise disabled:cursor-default disabled:opacity-40"
        role="tab"
        tabindex="0"
        :aria-label="item[itemName]"
        ignore-tip
        :disabled="item.disabled ? true : null"
        @click="menuClick(item)"
      >
        {{ item[itemName] }}
      </li>
    </ul>
  </teleport>
</template>

<script>
import { computed } from '@common/utils/vueTools'
import useMenuLocation from '@renderer/utils/compositions/useMenuLocation'

import { appSetting } from '@renderer/store/setting'


export default {
  name: 'MenuToolBar',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    xy: {
      type: Object,
      required: true,
    },
    menus: {
      type: Array,
      default() {
        return []
      },
    },
    itemName: {
      type: String,
      default: 'name',
    },
  },
  emits: ['update:modelValue', 'menu-click'],
  setup(props, { emit }) {
    const visible = computed(() => props.modelValue)
    const location = computed(() => props.xy)

    const onHide = () => {
      emit('update:modelValue', false)
      menuClick(null)
    }

    const { dom_menu, menuStyles } = useMenuLocation({
      visible,
      location,
      onHide,
    })

    const menuClick = (item) => {
      if (item?.disabled) return
      emit('menu-click', item)
    }

    return {
      dom_menu,
      menuStyles,
      menuClick,
      appSetting,
    }
  },
}
</script>
