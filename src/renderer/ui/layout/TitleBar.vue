<template>
  <!--
    Folia 式自绘标题栏：32px，整条是拖动区，右侧挂窗口控制。
    鼠标靠近顶部时背景才浮出来（Folia 的 titlebar reveal 行为），平时完全透明，
    让下面的封面/歌词透上来。
  -->
  <div
    class="absolute inset-x-0 top-0 z-[9999] h-8 select-none"
    :class="{ 'pointer-events-none': isFullscreen }"
    @mouseenter="revealed = true"
    @mouseleave="revealed = false"
  >
    <!-- 背景层：只在靠近时出现 -->
    <div
      class="absolute inset-0 transition-opacity duration-200"
      :class="[revealed ? 'opacity-100' : 'opacity-0', backdropClass]"
    />

    <div class="relative flex h-full items-center justify-between">
      <!-- 左侧：应用名 + 拖动区 -->
      <div class="app-drag flex h-full flex-1 items-center gap-2 pl-3">
        <span class="text-[11px] font-medium tracking-wide text-t3">猫仙音乐</span>
        <span
          v-if="currentViewLabel"
          class="text-[11px] text-t3/70"
        >· {{ currentViewLabel }}</span>
      </div>

      <!-- 右侧：窗口控制 -->
      <div class="relative z-10 h-full">
        <WindowControls />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from '@common/utils/vueTools'
import { useRoute } from '@common/utils/vueRouter'
import { isFullscreen, themeShouldUseDarkColors } from '@renderer/store'
import { useI18n } from '@root/lang'
import WindowControls from './WindowControls.vue'

const revealed = ref(false)
const route = useRoute()
const t = useI18n()

const backdropClass = computed(() => (
  themeShouldUseDarkColors.value
    ? 'bg-black/[0.18] backdrop-blur-sm border-b border-white/10'
    : 'bg-white/[0.28] backdrop-blur-sm border-b border-white/25'
))

const currentViewLabel = computed(() => {
  const name = route.meta?.name as string | undefined
  const map: Record<string, string> = {
    Search: t('search'),
    SongList: t('song_list'),
    Leaderboard: t('leaderboard'),
    List: t('my_list'),
    Download: t('download'),
    Setting: t('setting'),
  }
  return name ? map[name] ?? '' : ''
})
</script>
