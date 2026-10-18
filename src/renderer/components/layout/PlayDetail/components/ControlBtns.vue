<template>
  <div class="flex flex-row flex-nowrap items-center justify-end gap-2">
    <button
      type="button"
      class="grid h-6 w-6 cursor-pointer place-items-center rounded-full text-t2 opacity-70 transition-all duration-150 ease-ui hover:bg-fill hover:opacity-100"
      :class="appSetting['desktopLyric.enable'] ? 'text-accent opacity-90' : ''"
      :aria-label="toggleDesktopLyricBtnTitle"
      @click="toggleDesktopLyric"
      @contextmenu="toggleLockDesktopLyric"
    >
      <Captions :size="16" :stroke-width="2" />
    </button>
    <button
      type="button"
      class="grid h-6 w-6 cursor-pointer place-items-center rounded-full text-t2 opacity-70 transition-all duration-150 ease-ui hover:bg-fill hover:opacity-100"
      :class="appSetting['player.audioVisualization'] ? 'text-accent opacity-90' : ''"
      :aria-label="$t('audio_visualization')"
      @click="toggleAudioVisualization"
    >
      <AudioWaveform :size="15" :stroke-width="2" />
    </button>
    <button
      type="button"
      class="grid h-6 w-6 cursor-pointer place-items-center rounded-full text-t2 opacity-70 transition-all duration-150 ease-ui hover:bg-fill hover:opacity-100"
      :class="isShowLrcSelectContent ? 'text-accent opacity-90' : ''"
      :aria-label="$t('lyric__select')"
      @click="toggleVisibleLrc"
    >
      <Type :size="15" :stroke-width="2" />
    </button>
    <button
      type="button"
      class="grid h-6 w-6 cursor-pointer place-items-center rounded-full text-t2 opacity-70 transition-all duration-150 ease-ui hover:bg-fill hover:opacity-100"
      :class="isShowPlayComment ? 'text-accent opacity-90' : ''"
      :aria-label="$t('comment__show')"
      @click="toggleVisibleComment"
    >
      <MessageSquare :size="15" :stroke-width="2" />
    </button>
    <common-sound-effect-btn />
    <common-playback-rate-btn />
    <common-volume-btn />
    <common-toggle-play-mode-btn />
    <button
      type="button"
      class="grid h-6 w-6 cursor-pointer place-items-center rounded-full text-t2 opacity-70 transition-all duration-150 ease-ui hover:bg-fill hover:opacity-100"
      :aria-label="$t('player__add_music_to')"
      @click="isShowAddMusicTo = true"
    >
      <Plus :size="16" :stroke-width="2" />
    </button>
    <common-list-add-modal v-model:show="isShowAddMusicTo" :music-info="playMusicInfo.musicInfo" />
  </div>
</template>

<script>
import { AudioWaveform, Captions, MessageSquare, Plus, Type } from 'lucide-vue-next'
import { ref } from '@common/utils/vueTools'
import { useI18n } from '@renderer/plugins/i18n'

import {
  isShowLrcSelectContent,
  isShowPlayComment,
  playMusicInfo,
} from '@renderer/store/player/state'
import {
  setShowPlayLrcSelectContentLrc,
  setShowPlayComment,
} from '@renderer/store/player/action'

import useToggleDesktopLyric from '@renderer/utils/compositions/useToggleDesktopLyric'
import { dialog } from '@renderer/plugins/Dialog'
import { setMediaDeviceId } from '@renderer/plugins/player'
import { appSetting, saveMediaDeviceId, setEnableAudioVisualization } from '@renderer/store/setting'

export default {
  components: {
    AudioWaveform,
    Captions,
    MessageSquare,
    Plus,
    Type,
  },
  setup() {
    const t = useI18n()

    const toggleVisibleLrc = () => {
      setShowPlayLrcSelectContentLrc(!isShowLrcSelectContent.value)
    }
    const toggleVisibleComment = () => {
      setShowPlayComment(!isShowPlayComment.value)
    }

    const {
      toggleDesktopLyricBtnTitle,
      toggleDesktopLyric,
      toggleLockDesktopLyric,
    } = useToggleDesktopLyric()

    const isShowAddMusicTo = ref(false)

    const toggleAudioVisualization = async() => {
      const newSetting = !appSetting['player.audioVisualization']
      if (newSetting && appSetting['player.mediaDeviceId'] != 'default') {
        const confirm = await dialog.confirm({
          message: t('setting__player_audio_visualization_tip'),
          cancelButtonText: t('cancel_button_text'),
          confirmButtonText: t('confirm_button_text'),
        })
        if (!confirm) return
        await setMediaDeviceId('default').catch(_ => _)
        saveMediaDeviceId('default')
      }
      setEnableAudioVisualization(newSetting)
    }

    return {
      appSetting,
      isShowLrcSelectContent,
      toggleVisibleLrc,
      isShowPlayComment,
      toggleVisibleComment,
      toggleDesktopLyricBtnTitle,
      toggleDesktopLyric,
      toggleLockDesktopLyric,
      toggleAudioVisualization,
      isShowAddMusicTo,
      playMusicInfo,
    }
  },
}
</script>
