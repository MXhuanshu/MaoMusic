<template>
  <teleport to="#root">
    <ul
      ref="dom_menu"
      :style="menuStyles"
      class="absolute z-30 min-w-[124px] overflow-hidden rounded-[10px] border border-line bg-menu py-1 shadow-[0_10px_32px_rgba(0,0,0,0.32)]"
      role="menu"
    >
      <li
        v-for="item in visibleMenus"
        :key="item.action"
        class="cursor-pointer whitespace-nowrap px-3 py-[7px] text-[12.5px] transition-colors duration-100"
        :class="item.disabled
          ? 'cursor-default text-t3 opacity-50'
          : 'text-t2 hover:bg-fill hover:text-fg'"
        role="menuitem"
        :aria-disabled="item.disabled ? 'true' : 'false'"
        @click="menuClick(item)"
      >
        {{ item[itemName] }}
      </li>
    </ul>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from '@common/utils/vueTools'
import useMenuLocation from '@renderer/utils/compositions/useMenuLocation'
import { appSetting } from '@renderer/store/setting'

interface MenuItem {
  name: string
  action: string
  disabled?: boolean
  hide?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  xy: { x: number, y: number }
  menus: MenuItem[]
  itemName?: string
}>(), {
  itemName: 'name',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'menu-click': [item: MenuItem | null]
}>()

const visible = computed(() => props.modelValue)
const location = computed(() => props.xy)

const menuClick = (item: MenuItem) => {
  if (item?.disabled) return
  emit('menu-click', item)
}

const onHide = () => {
  emit('update:modelValue', false)
  menuClick(null as unknown as MenuItem)
}

const { dom_menu, menuStyles } = useMenuLocation({ visible, location, onHide })

const visibleMenus = computed(() => props.menus.filter((item: MenuItem) => (
  !item.hide && (item.action === 'download' ? appSetting['download.enable'] : true)
)))
</script>
