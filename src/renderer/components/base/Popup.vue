<template>
  <component :is="Teleport" to="#root">
    <div
      class="popup absolute z-10 flex max-h-[250px] max-w-[98%] rounded-[12px] bg-menu text-fg shadow-[0_4px_18px_rgba(0,0,0,.35)] ring-1 ring-line transition-[transform,opacity] duration-150 ease-ui"
      :class="[
        isShowTop ? 'popup--top origin-bottom' : 'origin-top',
        props.visible ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-[.8] opacity-0',
      ]"
      :style="popupStyle"
      :aria-hidden="!props.visible"
      @click.stop
      @mouseenter="emit('mouseenter', $event)"
      @mouseleave="emit('mouseleave', $event)"
      @transitionend="emit('transitionend', $event)"
    >
      <div ref="dom_content" class="max-h-[inherit] overflow-y-auto p-2.5">
        <slot />
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, reactive } from '@common/utils/vueTools'

// https://github.com/vuejs/core/issues/2855#issuecomment-768388962
import {
  Teleport as teleport_,
  type TeleportProps,
  type VNodeProps,
} from 'vue'
const Teleport = teleport_ as new () => {
  $props: VNodeProps & TeleportProps
}

const props = defineProps<{
  visible: boolean
  btnEl: HTMLElement | null
}>()

interface Emitter {
  (event: 'update:visible', visible: boolean): void
  (event: 'mouseenter', visible: MouseEvent): void
  (event: 'mouseleave', visible: MouseEvent): void
  (event: 'transitionend', visible: TransitionEvent): void
}
const emit = defineEmits<Emitter>()

const dom_content = ref<HTMLElement | null>(null)
const isShowTop = ref(false)

const popupStyle = reactive({
  maxHeight: 'none',
  top: '0px',
  left: '0px',
  '--arrow-left': '0px',
})

const arrowHeight = 9
const arrowWidth = 8
const sidePadding = 50

watch(() => props.visible, (visible) => {
  if (!visible || !dom_content.value || !props.btnEl) return
  const rect = props.btnEl.getBoundingClientRect()
  const maxHeight = document.body.clientHeight
  const elTop = rect.top - window.lx.rootOffset
  const bottomTopVal = elTop + rect.height
  const contentHeight = dom_content.value.scrollHeight + arrowHeight + sidePadding
  if (bottomTopVal + contentHeight < maxHeight || (contentHeight > elTop && elTop <= maxHeight - bottomTopVal)) {
    isShowTop.value = false
    popupStyle.top = bottomTopVal + arrowHeight + 'px'
    popupStyle.maxHeight = maxHeight - bottomTopVal - arrowHeight - sidePadding + 'px'
  } else {
    isShowTop.value = true
    let maxContentHeight = elTop - arrowHeight - sidePadding
    popupStyle.top = (elTop - (elTop < contentHeight ? elTop : contentHeight) + sidePadding) + 'px'
    popupStyle.maxHeight = maxContentHeight + 'px'
  }

  const maxWidth = document.body.clientWidth - 20
  let center = dom_content.value.clientWidth / 2
  let left = rect.left + rect.width / 2 - window.lx.rootOffset - center
  if (left < sidePadding) {
    center -= sidePadding - left
    left = sidePadding
  } else if (left + dom_content.value.clientWidth > maxWidth) {
    let newLeft = maxWidth - dom_content.value.clientWidth
    center = center + left - newLeft
    left = newLeft
  }
  popupStyle.left = left + 'px'
  popupStyle['--arrow-left'] = center - arrowWidth + 'px'
})

const handleHide = () => {
  emit('update:visible', false)
}


onMounted(() => {
  document.addEventListener('click', handleHide)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleHide)
})

</script>

<style scoped>
.popup::before {
  content: '';
  position: absolute;
  top: -6px;
  left: var(--arrow-left);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--color-menu);
}

.popup--top::before {
  top: 100%;
  border-bottom: none;
  border-top: 8px solid var(--color-menu);
}
</style>
