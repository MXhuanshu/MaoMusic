<template>
  <!--
    Folia 的悬浮胶囊播放条：贴底居中，圆角全圆，玻璃 + 模糊。
    收起时只有一行；鼠标悬停时把进度条和时长展开出来，平时不占视觉重量。
  -->
  <div
    v-show="!isShowPlayerDetail"
    class="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-5"
  >
    <div
      class="pointer-events-auto w-full max-w-[32rem] overflow-hidden rounded-full border border-line bg-glass shadow-[var(--pn-shadow)] backdrop-blur-xl backdrop-saturate-150 transition-[box-shadow] duration-200 ease-ui"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <div class="flex items-center gap-2.5 py-2 pl-2 pr-2.5">
        <!-- 封面：点开播放详情 -->
        <button
          type="button"
          class="relative h-9 w-9 shrink-0 overflow-hidden rounded-[10px] bg-fill2 transition-transform duration-150 ease-ui hover:scale-[1.04]"
          :aria-label="$t('player__pic_tip')"
          @click="showPlayerDetail"
          @contextmenu.prevent="handleToMusicLocation"
        >
          <img
            v-if="musicInfo.pic"
            :src="musicInfo.pic"
            class="h-full w-full object-cover"
            decoding="async"
            @error="imgError"
          >
          <span v-else class="grid h-full w-full place-items-center text-[11px] text-t3">猫</span>
        </button>

        <!-- 曲名 / 状态 -->
        <div class="min-w-0 flex-1 cursor-pointer" @click="showPlayerDetail">
          <div
            class="truncate text-[12.5px] font-medium leading-tight text-fg"
            :title="title"
            @click.stop="handleCopy(title)"
          >{{ title || '猫仙音乐' }}</div>
          <div class="mt-0.5 truncate text-[11px] leading-tight text-t3">{{ statusText }}</div>
        </div>

        <!-- 上一首 / 播放 / 下一首 -->
        <div class="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
            :aria-label="$t('player__prev')"
            @click="playPrev()"
          >
            <SkipBack :size="17" :stroke-width="2" fill="currentColor" />
          </button>

          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full bg-fg text-bg transition-transform duration-150 ease-ui hover:scale-105 active:scale-95"
            :aria-label="isPlay ? $t('player__pause') : $t('player__play')"
            @click="togglePlay"
          >
            <Pause v-if="isPlay" :size="17" :stroke-width="2" fill="currentColor" />
            <Play v-else :size="17" :stroke-width="2" fill="currentColor" class="translate-x-[1px]" />
          </button>

          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
            :aria-label="$t('player__next')"
            @click="playNext()"
          >
            <SkipForward :size="17" :stroke-width="2" fill="currentColor" />
          </button>
        </div>

        <span class="mx-0.5 h-5 w-px shrink-0 bg-line" />

        <!-- 音量 / 播放模式 / 加歌 / 桌面歌词：先复用旧组件，P4 用新原语重写 -->
        <div class="flex shrink-0 items-center gap-1">
          <common-volume-btn />
          <common-toggle-play-mode-btn />

          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg disabled:opacity-40"
            :aria-label="$t('player__add_music_to')"
            :disabled="!musicInfo.id"
            @click="addMusicTo"
          >
            <Plus :size="16" :stroke-width="2" />
          </button>

          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full transition-colors duration-150 hover:bg-fill"
            :class="appSetting['desktopLyric.enable'] ? 'text-accent' : 'text-t2 hover:text-fg'"
            :aria-label="toggleDesktopLyricBtnTitle"
            :title="toggleDesktopLyricBtnTitle"
            @click="toggleDesktopLyric"
            @contextmenu.prevent="toggleLockDesktopLyric"
          >
            <Captions :size="16" :stroke-width="2" />
          </button>
        </div>
      </div>

      <!-- 进度：悬停展开。用 motion-v 做 height:auto 动画，CSS 的 max-height 只能给死值 -->
      <motion.div
        class="overflow-hidden"
        :initial="false"
        :animate="{ height: hovering ? 'auto' : 0, opacity: hovering ? 1 : 0 }"
        :transition="{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }"
      >
        <div class="flex items-center gap-2 px-4 pb-2">
          <span class="w-9 shrink-0 text-right text-[10.5px] tabular-nums text-t3">{{ nowPlayTimeStr }}</span>
          <UiProgressBar class="flex-1" />
          <span class="w-9 shrink-0 text-[10.5px] tabular-nums text-t3">{{ maxPlayTimeStr }}</span>
        </div>
      </motion.div>
    </div>

    <common-list-add-modal v-model:show="isShowAddMusicTo" :music-info="playMusicInfo.musicInfo" />
  </div>
</template>

<script setup lang="ts">
import { Captions, Pause, Play, Plus, SkipBack, SkipForward } from 'lucide-vue-next'
import { motion } from 'motion-v'
import { computed, ref } from '@common/utils/vueTools'
import { useRouter } from '@common/utils/vueRouter'
import { clipboardWriteText } from '@common/utils/electron'
import { LIST_IDS } from '@common/constants'
import {
  isPlay,
  isShowPlayerDetail,
  musicInfo,
  playInfo,
  playMusicInfo,
  statusText,
} from '@renderer/store/player/state'
import { setMusicInfo, setShowPlayerDetail } from '@renderer/store/player/action'
import { appSetting } from '@renderer/store/setting'
import { playNext, playPrev, togglePlay } from '@renderer/core/player'
import { formatMusicName } from '@renderer/utils'
import usePlayProgress from '@renderer/utils/compositions/usePlayProgress'
import useToggleDesktopLyric from '@renderer/utils/compositions/useToggleDesktopLyric'
import UiProgressBar from '../features/player/UiProgressBar.vue'

const router = useRouter()
const hovering = ref(false)
const isShowAddMusicTo = ref(false)

const { nowPlayTimeStr, maxPlayTimeStr } = usePlayProgress()
const {
  toggleDesktopLyricBtnTitle,
  toggleDesktopLyric,
  toggleLockDesktopLyric,
} = useToggleDesktopLyric()

const title = computed(() => (
  musicInfo.name
    ? formatMusicName(appSetting['download.fileName'], musicInfo.name, musicInfo.singer)
    : ''
))

const showPlayerDetail = () => {
  if (!playMusicInfo.musicInfo) return
  setShowPlayerDetail(true)
}

const handleCopy = (text: string) => {
  if (text) clipboardWriteText(text)
}

const imgError = () => {
  setMusicInfo({ pic: null })
}

const addMusicTo = () => {
  if (!musicInfo.id) return
  isShowAddMusicTo.value = true
}

const handleToMusicLocation = () => {
  const listId = playMusicInfo.listId
  if (!listId || listId == LIST_IDS.DOWNLOAD || !playMusicInfo.musicInfo) return
  if (playInfo.playIndex == -1) return
  void router.push({
    path: '/list',
    query: {
      id: listId,
      scrollIndex: playInfo.playIndex,
    },
  })
}
</script>
