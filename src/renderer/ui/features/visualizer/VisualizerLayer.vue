<template>
  <!--
    播放详情的视觉舞台，压在内容下面（pointer-events-none）。
    full：星野背景 + 3D 歌词走廊；lite：纯 CSS 涟漪渐变；off：什么都不画，
    只留 PlayerDetail 自己的封面模糊背景。
  -->
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <!-- 全屏音乐磁贴：当前播放列表的封面墙，纯 CSS，lite 档位也能开 -->
    <!-- 磁贴墙是纯 CSS 背景，不受视觉档位影响，选它就一定看得到 -->
    <MosaicWall v-if="background === 'mosaic'" :accent="colors.accent" />

    <Sora
      v-if="mode === 'full' && background === 'starfield'"
      :accent="colors.accent"
      :background="colors.background"
      :power="power"
      :paused="paused"
    />
    <Diorama
      v-if="mode === 'full'"
      :lines="lineTexts"
      :active-index="activeIndex"
      :progress="lineProgress"
      :power="power"
      :accent="colors.accent"
      :text="colors.text"
      :dim="colors.dim"
      :paused="paused"
    />

    <div v-if="mode === 'lite' && background === 'starfield'" class="absolute inset-0" :style="liteStyle" />

    <!-- 统一压一层纵向渐变，保证白色文字在星光上依然可读 -->
    <div class="absolute inset-0 bg-gradient-to-b from-bg/10 via-bg/45 to-bg" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref } from '@common/utils/vueTools'
import { appSetting } from '@renderer/store/setting'
import { lyric } from '@renderer/store/player/lyric'
import { playProgress } from '@renderer/store/player/playProgress'
import { activeTheme } from '@renderer/core/theme/state'
import MosaicWall from './MosaicWall.vue'
import { useVisualizerMode } from './useVisualizerMode'
import { useAudioPower } from './useAudioPower'

// three.js 只在这两个组件里出现，异步加载保证首屏不背它；full 模式才会真正请求分块。
const loadDiorama = async() => await import(/* webpackChunkName: "visualizer-diorama" */ './Diorama.vue')
const loadSora = async() => await import(/* webpackChunkName: "visualizer-sora" */ './backgrounds/Sora.vue')
const Diorama = defineAsyncComponent(loadDiorama)
const Sora = defineAsyncComponent(loadSora)

const mode = useVisualizerMode()
const { power } = useAudioPower()

const hidden = ref(false)
const handleVisibility = () => {
  hidden.value = document.hidden
}
onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibility)
})
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibility)
})

const paused = computed(() => hidden.value)

// 背景二选一：磁贴墙（默认）或星野，都在设置里可切换
const background = computed(() => appSetting['playDetail.background'] ?? 'mosaic')

const colors = computed(() => ({
  background: activeTheme.value.backgroundColor,
  accent: activeTheme.value.accentColor,
  text: activeTheme.value.primaryColor,
  dim: activeTheme.value.secondaryColor,
}))

const lineTexts = computed(() => lyric.lines.map(line => line.text))

const activeIndex = computed(() => {
  if (!lineTexts.value.length) return 0
  return Math.min(Math.max(0, lyric.line), lineTexts.value.length - 1)
})

const lineProgress = computed(() => {
  const lines = lyric.lines
  const current = lines[activeIndex.value]
  if (!current) return 0
  const next = lines[activeIndex.value + 1]
  const start = current.time
  const end = next?.time ?? start + 4
  const span = end - start || 1
  const now = playProgress.nowPlayTime - lyric.offset
  return Math.min(1, Math.max(0, (now - start) / span))
})

const liteStyle = computed(() => {
  const accent = colors.value.accent
  const background = colors.value.background
  return {
    background: `radial-gradient(130% 90% at 50% -10%, ${accent}2e 0%, transparent 62%), radial-gradient(90% 70% at 85% 110%, ${accent}18 0%, transparent 55%), linear-gradient(180deg, ${background} 0%, ${background} 100%)`,
  }
})
</script>
