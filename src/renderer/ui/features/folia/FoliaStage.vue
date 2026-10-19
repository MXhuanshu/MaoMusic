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
  /** 舞台是否真的渲染出了内容；false 时调用方应退回平面歌词 */
  rendered: [ok: boolean]
}>()

const dom_stage = ref<HTMLElement | null>(null)
let root: Root | null = null
let stageHandle: { setTime: (t: number) => void, setPower: (p: number) => void } | null = null
let rafId: number | null = null

// 播放时间与频谱走 MotionValue 直接更新，避免每帧重渲染 React 树
const tick = () => {
  rafId = requestAnimationFrame(tick)
  if (!stageHandle) return
  stageHandle.setTime(playProgress.nowPlayTime)
  stageHandle.setPower(0)
}

/** 解析 LX Music 逐字歌词（lxlrc）：每行 [mm:ss.xxx]，词用 <mm:ss.xxx> 包裹 */
const parseLxLyricWords = (lxlrc: string): Map<string, Array<{ text: string, startTime: number, endTime: number }>> => {
  const result = new Map<string, Array<{ text: string, startTime: number, endTime: number }>>()
  const timeToSec = (t: string) => {
    const m = /(\d+):(\d+(?:\.\d+)?)/.exec(t)
    if (!m) return 0
    return Number(m[1]) * 60 + Number(m[2])
  }
  for (const rawLine of lxlrc.split('\n')) {
    const lineMatch = /^\[(\d+:\d+(?:\.\d+)?)\]/.exec(rawLine)
    if (!lineMatch) continue
    const lineStart = timeToSec(lineMatch[1])
    const words: Array<{ text: string, startTime: number, endTime: number }> = []
    const wordRxp = /<(\d+:\d+(?:\.\d+)?)>([^<]*)/g
    let match: RegExpExecArray | null
    while ((match = wordRxp.exec(rawLine)) !== null) {
      words.push({ text: match[2], startTime: timeToSec(match[1]), endTime: timeToSec(match[1]) })
    }
    // 用下一个词的开始时间作为上一个词的结束时间
    for (let i = 0; i < words.length - 1; i++) words[i].endTime = words[i + 1].startTime
    if (words.length) {
      const key = lineStart.toFixed(3)
      const existing = result.get(key)
      if (existing) existing.push(...words)
      else result.set(key, words)
    }
  }
  return result
}

/** 猫仙歌词：有逐字（lxlrc）时按词同步，否则每行一个词，不伪造逐字 */
const foliaLines = computed<Line[]>(() => {
  const lines = lyric.lines
  const wordMap = musicInfo.lxlrc ? parseLxLyricWords(musicInfo.lxlrc) : null

  return lines.map((line, index) => {
    const next = lines[index + 1]
    const startTime = line.time
    const endTime = next ? next.time : startTime + 5
    const words = wordMap?.get(startTime.toFixed(3))
    return {
      words: words?.length ? words : [{ text: line.text, startTime, endTime }],
      startTime,
      endTime,
      fullText: line.text,
      translation: line.extendedLyrics.find(l => l && l !== line.text) ?? undefined,
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
    ref: (handle: any) => {
      stageHandle = handle
    },
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
  reportRendered()
}

onMounted(() => {
  if (!dom_stage.value) return
  root = createRoot(dom_stage.value)
  render()
  rafId = requestAnimationFrame(tick)
  reportRendered()
})

// Folia 的模式渲染器是 React.lazy + Suspense(fallback=null)，在打包后的 Electron 里
// 可能长时间不出内容（异步 chunk 未就绪、WebGL 不可用等）。
// 这里把「舞台上是否真的渲染出了东西」回传给调用方，由调用方决定是否退回平面歌词，
// 避免出现「完整模式下整页空白、一首歌词都看不到」。
let reportTimer: ReturnType<typeof setTimeout> | null = null
const reportRendered = () => {
  if (reportTimer) clearTimeout(reportTimer)
  reportTimer = setTimeout(() => {
    const el = dom_stage.value
    emit('rendered', !!el && el.childElementCount > 0)
  }, 500)
}

watch([
  mode,
  backgroundMode,
  visualizerTunings,
  foliaTheme,
  foliaLines,
  currentLineIndex,
  () => playProgress.maxPlayTime,
  () => musicInfo.pic,
  () => musicInfo.name,
  () => musicInfo.singer,
  () => musicInfo.album,
  () => musicInfo.lxlrc,
  () => props.paused,
], render, { deep: false })

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
  if (reportTimer) clearTimeout(reportTimer)
  reportTimer = null
  stageHandle = null
  root?.unmount()
  root = null
})
</script>
