<template>
  <!--
    Folia 式进度条：轨道 6px 圆头，填充用宽度而不是 clip-path（Chromium 下宽度更省合成层）。
    真正接收拖拽的是一个透明 range，这样键盘左右键、拖动、点击都能用，且不用自己算指针偏移。
  -->
  <div
    class="group/progress relative flex h-4 w-full items-center"
    @pointerenter="hovering = true"
    @pointerleave="hovering = false"
  >
    <div
      class="relative w-full overflow-hidden rounded-full transition-[height] duration-150 ease-ui"
      :class="hovering || dragging ? 'h-1.5' : 'h-1'"
    >
      <div class="absolute inset-0 bg-track" />
      <div
        class="absolute inset-y-0 left-0 rounded-full bg-fg transition-[width] duration-150 ease-linear"
        :style="{ width: `${displayPercent}%` }"
      />
    </div>

    <input
      class="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
      type="range"
      min="0"
      max="1000"
      step="1"
      :value="Math.round(displayPercent * 10)"
      :aria-label="'progress'"
      @pointerdown="handleDown"
      @input="handleInput"
      @change="handleUp"
      @pointerup="handleUp"
    >
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from '@common/utils/vueTools'
import { playProgress } from '@renderer/store/player/playProgress'

const hovering = ref(false)
const dragging = ref(false)
const dragPercent = ref(0)

const displayPercent = computed(() => (
  dragging.value ? dragPercent.value : playProgress.progress * 100
))

const handleDown = () => {
  dragging.value = true
  dragPercent.value = playProgress.progress * 100
}

const handleInput = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  dragPercent.value = value / 10
  // 拖动过程中只改本地值，避免播放进度回写把滑块拽回去
  if (!dragging.value) {
    dragging.value = true
  }
}

const handleUp = () => {
  if (!dragging.value) return
  const ratio = Math.min(1, Math.max(0, dragPercent.value / 100))
  window.app_event.setProgress(ratio * playProgress.maxPlayTime)
  dragging.value = false
}
</script>
