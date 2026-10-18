<template>
  <!--
    Folia 进度条的 Vue 宿主：播放时间通过 MotionValue 直接更新，
    seek 回调转给猫仙的播放器。
  -->
  <div ref="dom_progress" class="min-w-0 flex-1" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from '@common/utils/vueTools'
import { createRoot, type Root } from 'react-dom/client'
import { createElement } from 'react'
import FoliaProgressBar from './FoliaProgressBar'
import { playProgress } from '@renderer/store/player/playProgress'
import { activeTheme } from '@renderer/core/theme/state'

const props = defineProps<{
  disabled?: boolean
}>()

const dom_progress = ref<HTMLElement | null>(null)
let root: Root | null = null
let handle: { setTime: (t: number) => void } | null = null
let rafId: number | null = null

const tick = () => {
  rafId = requestAnimationFrame(tick)
  handle?.setTime(playProgress.nowPlayTime)
}

const render = () => {
  if (!root) return
  root.render(createElement(FoliaProgressBar, {
    ref: (h: any) => {
      handle = h
    },
    duration: playProgress.maxPlayTime,
    currentTime: playProgress.nowPlayTime,
    fillColor: activeTheme.value.accentColor,
    trackColor: 'rgba(255,255,255,0.12)',
    textColor: activeTheme.value.secondaryColor,
    disabled: props.disabled,
    onSeek: (time: number) => {
      window.app_event.setProgress(time)
    },
  }))
}

onMounted(() => {
  if (!dom_progress.value) return
  root = createRoot(dom_progress.value)
  render()
  rafId = requestAnimationFrame(tick)
})

watch([
  () => playProgress.maxPlayTime,
  () => activeTheme.value.accentColor,
  () => activeTheme.value.secondaryColor,
  () => props.disabled,
], render)

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
  handle = null
  root?.unmount()
  root = null
})
</script>
