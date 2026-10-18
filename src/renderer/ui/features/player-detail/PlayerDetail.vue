<template>
  <!--
    播放详情页：全屏沉浸层。
    中心是歌词，右侧是玻璃抽屉（信息 / 评论），底部是详情播放条。
    背景先用「封面模糊 + 强调色渐变」，WebGL 视觉层在播放详情视觉阶段接管这里的第一层。
  -->
  <transition
    enter-active-class="transition-[transform,opacity] duration-300 ease-ui"
    enter-from-class="translate-y-5 opacity-0"
    leave-active-class="transition-[transform,opacity] duration-200 ease-standard"
    leave-to-class="translate-y-6 opacity-0"
    @after-enter="handleAfterEnter"
    @after-leave="handleAfterLeave"
  >
    <section
      v-if="isShowPlayerDetail"
      class="absolute inset-0 z-30 flex flex-col overflow-hidden bg-bg text-fg"
      @contextmenu="handleContextMenu"
    >
      <!-- 背景层：封面模糊打底 → 旧频谱 → Folia 视觉舞台 -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          v-if="musicInfo.pic"
          :src="musicInfo.pic"
          class="h-full w-full scale-125 object-cover opacity-20 blur-[72px]"
          decoding="async"
          alt=""
        >
        <common-audio-visualizer
          v-if="appSetting['player.audioVisualization'] && visibled"
          class="absolute inset-x-0 bottom-0 h-2/5 opacity-25"
        />
        <!-- Folia 视觉舞台（React island，folia-src 原码） -->
        <FoliaStage v-if="visibled && appSetting['playDetail.visualizer'] === 'full'" @back="hide" />
      </div>

      <!-- 顶部：收起 + 窗口控制 -->
      <header class="app-drag relative z-10 flex h-10 shrink-0 items-center gap-2 px-3">
        <button
          type="button"
          class="app-no-drag grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
          :aria-label="$t('player__hide_detail_tip')"
          :title="$t('player__hide_detail_tip')"
          @click="hide"
        >
          <ChevronDown :size="17" :stroke-width="2.2" />
        </button>

        <div class="min-w-0 flex-1 truncate text-[12px] text-t3">
          {{ musicInfo.name }}
        </div>

        <div class="app-no-drag flex shrink-0 items-center gap-1">
          <button
            v-if="isFullscreen"
            type="button"
            class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
            :aria-label="$t('fullscreen_exit')"
            :title="$t('fullscreen_exit')"
            @click="fullscreenExit"
          >
            <Minimize2 :size="14" :stroke-width="2" />
          </button>
          <button
            type="button"
            class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
            :aria-label="$t('min')"
            :title="$t('min')"
            @click="min"
          >
            <Minus :size="15" :stroke-width="2" />
          </button>
          <button
            type="button"
            class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-err/15 hover:text-err"
            :aria-label="$t('close')"
            :title="$t('close')"
            @click="close"
          >
            <X :size="15" :stroke-width="2" />
          </button>
        </div>
      </header>

      <!-- 主体：歌词 + 右侧抽屉 -->
      <div class="relative z-10 flex min-h-0 flex-1 gap-3 px-3 pb-2">
        <div class="relative min-w-0 flex-1 overflow-hidden">
          <!-- 完整视觉下歌词由 3D 走廊承载，这里不再叠一份平面歌词 -->
          <LyricPlayer v-if="visibled && showFlatLyric" class="h-full" />
        </div>

        <PanelShell v-model="activeTab" :tabs="tabs" class="mb-1">
          <template #info>
            <div class="flex flex-col gap-4 p-4">
              <div class="relative w-full overflow-hidden rounded-[14px] bg-fill2" style="aspect-ratio: 1 / 1;">
                <img
                  v-if="musicInfo.pic"
                  :src="musicInfo.pic"
                  class="h-full w-full object-cover"
                  decoding="async"
                  alt=""
                  @error="imgError"
                >
                <div v-else class="grid h-full w-full place-items-center text-[13px] text-t3">猫仙音乐</div>
              </div>

              <div class="min-w-0">
                <h2 class="truncate text-[17px] font-semibold leading-tight text-fg" :title="musicInfo.name">
                  {{ musicInfo.name || $t('player_detail__not_playing') }}
                </h2>
                <p class="mt-1.5 truncate text-[12.5px] text-t2">{{ musicInfo.singer }}</p>
                <p v-if="musicInfo.album" class="mt-1 truncate text-[12px] text-t3">{{ musicInfo.album }}</p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <UiButton size="sm" variant="secondary" :disabled="!musicInfo.id" @click="addMusicTo">
                  <Plus :size="13" :stroke-width="2" />
                  <span>{{ $t('player__add_music_to') }}</span>
                </UiButton>
                <UiButton
                  size="sm"
                  :variant="appSetting['desktopLyric.enable'] ? 'primary' : 'ghost'"
                  @click="toggleDesktopLyric"
                  @contextmenu.prevent="toggleLockDesktopLyric"
                >
                  <Captions :size="13" :stroke-width="2" />
                  <span>{{ toggleDesktopLyricBtnTitle }}</span>
                </UiButton>
              </div>

              <div class="rounded-[12px] border border-line bg-fill/40 p-3">
                <div class="text-[11px] uppercase tracking-wider text-t3">{{ $t('player_detail__status') }}</div>
                <div class="mt-1.5 text-[12.5px] leading-relaxed text-t2">{{ statusText }}</div>
              </div>
            </div>
          </template>

          <template #comment>
            <music-comment
              class="h-full"
              :show="activeTab === 'comment'"
              :music-info="playMusicInfo.musicInfo"
              @close="handleCloseComment"
            />
          </template>
        </PanelShell>
      </div>

      <!-- 底部详情播放条 -->
      <footer class="relative z-10 flex h-16 shrink-0 items-center gap-3 px-5 pb-1">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
              :aria-label="$t('player__prev')"
              @click="playPrev()"
            >
              <SkipBack :size="17" :stroke-width="2" fill="currentColor" />
            </button>
            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-full bg-fg text-bg transition-transform duration-150 ease-ui hover:scale-105 active:scale-95"
              :aria-label="isPlay ? $t('player__pause') : $t('player__play')"
              @click="togglePlay"
            >
              <Pause v-if="isPlay" :size="18" :stroke-width="2" fill="currentColor" />
              <Play v-else :size="18" :stroke-width="2" fill="currentColor" class="translate-x-[1px]" />
            </button>
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
              :aria-label="$t('player__next')"
              @click="playNext()"
            >
              <SkipForward :size="17" :stroke-width="2" fill="currentColor" />
            </button>
          </div>

          <span class="w-10 shrink-0 text-right text-[11px] tabular-nums text-t3">{{ nowPlayTimeStr }}</span>
          <FoliaProgressBar class="min-w-0 flex-1" />
          <span class="w-10 shrink-0 text-[11px] tabular-nums text-t3">{{ maxPlayTimeStr }}</span>
        </div>

        <div class="flex shrink-0 items-center gap-1">
          <common-volume-btn />
          <common-toggle-play-mode-btn />
          <common-playback-rate-btn />
        </div>
      </footer>

      <common-list-add-modal v-model:show="isShowAddMusicTo" :music-info="playMusicInfo.musicInfo" />
    </section>
  </transition>
</template>

<script>
import { Captions, ChevronDown, Minimize2, Minus, Pause, Play, Plus, SkipBack, SkipForward, X } from 'lucide-vue-next'
import { computed, ref, watch } from '@common/utils/vueTools'
import { useI18n } from '@renderer/plugins/i18n'
import { isFullscreen } from '@renderer/store'
import {
  isPlay,
  isShowPlayerDetail,
  isShowPlayComment,
  musicInfo,
  playMusicInfo,
  statusText,
} from '@renderer/store/player/state'
import {
  setMusicInfo,
  setShowPlayerDetail,
  setShowPlayComment,
  setShowPlayLrcSelectContentLrc,
} from '@renderer/store/player/action'
import { playNext, playPrev, togglePlay } from '@renderer/core/player'
import { appSetting } from '@renderer/store/setting'
import { closeWindow, minWindow, setFullScreen } from '@renderer/utils/ipc'
import usePlayProgress from '@renderer/utils/compositions/usePlayProgress'
import useToggleDesktopLyric from '@renderer/utils/compositions/useToggleDesktopLyric'
import LyricPlayer from '@renderer/components/layout/PlayDetail/LyricPlayer.vue'
import MusicComment from '@renderer/components/layout/PlayDetail/components/MusicComment/index.vue'
import { registerAutoHideMounse, unregisterAutoHideMounse } from '@renderer/components/layout/PlayDetail/autoHideMounse'
import PanelShell from '@renderer/ui/features/panel/PanelShell.vue'
import FoliaStage from '@renderer/ui/features/folia/FoliaStage.vue'
import FoliaProgressBar from '@renderer/ui/features/folia/FoliaProgressBar.vue'
import { useVisualizerMode } from '@renderer/ui/features/visualizer/useVisualizerMode'
import { lyric } from '@renderer/store/player/lyric'
import UiButton from '@renderer/ui/primitives/UiButton.vue'

export default {
  name: 'PlayerDetail',
  components: {
    Captions,
    ChevronDown,
    Minimize2,
    Minus,
    Pause,
    Play,
    Plus,
    SkipBack,
    SkipForward,
    X,
    LyricPlayer,
    MusicComment,
    PanelShell,
    FoliaStage,
    FoliaProgressBar,
    UiButton,
  },
  setup() {
    const visibled = ref(false)
    const isShowAddMusicTo = ref(false)
    const activeTab = ref('info')

    const { nowPlayTimeStr, maxPlayTimeStr } = usePlayProgress()
    const {
      toggleDesktopLyricBtnTitle,
      toggleDesktopLyric,
      toggleLockDesktopLyric,
    } = useToggleDesktopLyric()

    const t = useI18n()
    const visualizerMode = useVisualizerMode()
    // 3D 歌词只在「完整」档位接管歌词；没有歌词时退回平面歌词
    const showFlatLyric = computed(() => visualizerMode.value !== 'full' || !lyric.lines.length)

    const tabs = computed(() => [
      { id: 'info', label: t('player_detail__tab_info') },
      { id: 'comment', label: t('player_detail__tab_comment') },
    ])

    let clickTime = 0

    const hide = () => {
      setShowPlayerDetail(false)
    }

    const handleContextMenu = () => {
      if (window.performance.now() - clickTime > 400) {
        clickTime = window.performance.now()
        return
      }
      clickTime = 0
      hide()
    }

    const handleCloseComment = () => {
      setShowPlayComment(false)
      activeTab.value = 'info'
    }

    const handleAfterEnter = () => {
      if (isFullscreen.value) registerAutoHideMounse()
      visibled.value = true
    }

    const handleAfterLeave = () => {
      setShowPlayLrcSelectContentLrc(false)
      setShowPlayComment(false)
      visibled.value = false
      unregisterAutoHideMounse()
    }

    watch(isFullscreen, fullscreen => {
      (fullscreen ? registerAutoHideMounse : unregisterAutoHideMounse)()
    })

    // 评论面板在旧实现里是独立浮层，这里用页签承载，切换时同步旧状态位
    watch(activeTab, tab => {
      setShowPlayComment(tab === 'comment')
    })
    watch(isShowPlayComment, show => {
      if (!show && activeTab.value === 'comment') activeTab.value = 'info'
    })

    const imgError = () => {
      setMusicInfo({ pic: null })
    }

    const addMusicTo = () => {
      if (!musicInfo.id) return
      isShowAddMusicTo.value = true
    }

    return {
      appSetting,
      playMusicInfo,
      isShowPlayerDetail,
      musicInfo,
      statusText,
      isPlay,
      isFullscreen,
      visibled,
      showFlatLyric,
      activeTab,
      tabs,
      isShowAddMusicTo,
      nowPlayTimeStr,
      maxPlayTimeStr,
      toggleDesktopLyricBtnTitle,
      toggleDesktopLyric,
      toggleLockDesktopLyric,
      hide,
      handleContextMenu,
      handleCloseComment,
      handleAfterEnter,
      handleAfterLeave,
      imgError,
      addMusicTo,
      playNext,
      playPrev,
      togglePlay,
      fullscreenExit() {
        void setFullScreen(false).then(fullscreen => {
          isFullscreen.value = fullscreen
        })
      },
      min() {
        minWindow()
      },
      close() {
        closeWindow()
      },
    }
  },
}
</script>
