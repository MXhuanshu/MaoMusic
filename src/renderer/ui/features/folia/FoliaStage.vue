<template>
  <!--
    Folia 视觉舞台的 Vue 宿主：把猫仙的播放状态、歌词与主题桥接给 React island。
    视觉实现全部来自 src/renderer/folia-src（Folia 原码，AGPL-3.0）。
  -->
  <div ref="dom_stage" class="pointer-events-none absolute inset-0 overflow-hidden" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from '@common/utils/vueTools'
import { createRoot, type Root } from 'react-dom/client'
import { createElement } from 'react'
import FoliaStage from './FoliaStage'
import { lyric } from '@renderer/store/player/lyric'
import { playProgress } from '@renderer/store/player/playProgress'
import { musicInfo } from '@renderer/store/player/state'
import { activeTheme } from '@renderer/core/theme/state'
import { appSetting } from '@renderer/store/setting'
import type { Line, Theme } from '@renderer/folia-src/types'

const props = defineProps<{
  paused?: boolean
}>()

const emit = defineEmits<{
  back: []
}>()

const dom_stage = ref<HTMLElement | null>(null)
let root: Root | null = null

/** 猫仙歌词只有行级时间戳：每行合成一个覆盖整行的词，不做伪造的逐字切分 */
const foliaLines = computed<Line[]>(() => {
  const lines = lyric.lines
  return lines.map((line, index) => {
    const next = lines[index + 1]
    const startTime = line.time
    const endTime = next ? next.time : startTime + 5
    return {
      words: [{ text: line.text, startTime, endTime }],
      startTime,
      endTime,
      fullText: line.text,
    }
  })
})

const foliaTheme = computed<Theme>(() => {
  const theme = activeTheme.value
  return {
    name: 'cover',
    backgroundColor: theme.backgroundColor,
    primaryColor: theme.primaryColor,
    accentColor: theme.accentColor,
    secondaryColor: theme.secondaryColor,
    fontStyle: 'sans',
    animationIntensity: 'normal',
  }
})

const mode = computed(() => (appSetting['playDetail.visualizerMode'] ?? 'classic') as any)
const backgroundMode = computed(() => (appSetting['playDetail.backgroundMode'] ?? 'sora') as any)
const visualizerTunings = computed(() => appSetting['playDetail.visualizerTunings'] ?? {})

const currentLineIndex = computed(() => {
  const line = lyric.line
  return line >= 0 && line < foliaLines.value.length ? line : 0
})

const render = () => {
  if (!root) return
  root.render(createElement(FoliaStage, {
    mode: mode.value,
    theme: foliaTheme.value,
    lines: foliaLines.value,
    currentLineIndex: currentLineIndex.value,
    currentTime: playProgress.nowPlayTime,
    duration: playProgress.maxPlayTime,
    audioPower: 0,
    paused: props.paused ?? false,
    coverUrl: musicInfo.pic ?? null,
    songTitle: musicInfo.name ?? null,
    songArtist: musicInfo.singer ?? null,
    songAlbum: musicInfo.album ?? null,
    isDaylight: document.documentElement.dataset.daylight === 'true',
    backgroundMode: backgroundMode.value,
    visualizerTunings: visualizerTunings.value,
    onBack: () => {
      emit('back')
    },
  }))
}

onMounted(() => {
  if (!dom_stage.value) return
  root = createRoot(dom_stage.value)
  render()
})

watch([
  mode,
  backgroundMode,
  visualizerTunings,
  foliaTheme,
  foliaLines,
  currentLineIndex,
  () => playProgress.nowPlayTime,
  () => playProgress.maxPlayTime,
  () => musicInfo.pic,
  () => musicInfo.name,
  () => musicInfo.singer,
  () => musicInfo.album,
  () => props.paused,
], render, { deep: false })

onBeforeUnmount(() => {
  root?.unmount()
  root = null
})
</script>
