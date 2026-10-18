<template lang="pug">
.setting-panel
  UiSettingSection(:title="$t('setting__desktop_lyric')")
    .flex.flex-col.gap-1.py-1
      UiCheckbox(
        id="setting_desktop_lyric_enable"
        :model-value="appSetting['desktopLyric.enable']"
        :label="$t('setting__desktop_lyric_enable')"
        @update:model-value="updateSetting({ 'desktopLyric.enable': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_lock"
        :model-value="appSetting['desktopLyric.isLock']"
        :label="$t('setting__desktop_lyric_lock')"
        @update:model-value="updateSetting({ 'desktopLyric.isLock': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_fullscreen_hide"
        :model-value="appSetting['desktopLyric.fullscreenHide']"
        :label="$t('setting__desktop_lyric_fullscreen_hide')"
        @update:model-value="updateSetting({ 'desktopLyric.fullscreenHide': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_pause_hide"
        :model-value="appSetting['desktopLyric.pauseHide']"
        :label="$t('setting__desktop_lyric_pause_hide')"
        @update:model-value="updateSetting({ 'desktopLyric.pauseHide': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_audio_visualization"
        :model-value="appSetting['desktopLyric.audioVisualization']"
        :label="$t('setting__desktop_lyric_audio_visualization')"
        @update:model-value="updateSetting({ 'desktopLyric.audioVisualization': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_delayScroll"
        :model-value="appSetting['desktopLyric.isDelayScroll']"
        :label="$t('setting__desktop_lyric_delay_scroll')"
        @update:model-value="updateSetting({ 'desktopLyric.isDelayScroll': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_alwaysOnTop"
        :model-value="appSetting['desktopLyric.isAlwaysOnTop']"
        :label="$t('setting__desktop_lyric_always_on_top')"
        @update:model-value="updateSetting({ 'desktopLyric.isAlwaysOnTop': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_showTaskbar"
        :model-value="appSetting['desktopLyric.isShowTaskbar']"
        :label="$t('setting__desktop_lyric_show_taskbar')"
        @update:model-value="updateSetting({ 'desktopLyric.isShowTaskbar': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_alwaysOnTopLoop"
        :model-value="appSetting['desktopLyric.isAlwaysOnTopLoop']"
        :label="$t('setting__desktop_lyric_always_on_top_loop')"
        @update:model-value="updateSetting({ 'desktopLyric.isAlwaysOnTopLoop': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_lockScreen"
        :model-value="appSetting['desktopLyric.isLockScreen']"
        :label="$t('setting__desktop_lyric_lock_screen')"
        @update:model-value="updateSetting({ 'desktopLyric.isLockScreen': $event })")
      template(v-if="!isLinux")
        UiCheckbox(
          id="setting_desktop_lyric_hoverHide"
          :model-value="appSetting['desktopLyric.isHoverHide']"
          :label="$t('setting__desktop_lyric_hover_hide')"
          @update:model-value="updateSetting({ 'desktopLyric.isHoverHide': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_ellipsis"
        :model-value="appSetting['desktopLyric.style.ellipsis']"
        :label="$t('setting__desktop_lyric_ellipsis')"
        @update:model-value="updateSetting({ 'desktopLyric.style.ellipsis': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_zoom"
        :model-value="appSetting['desktopLyric.style.isZoomActiveLrc']"
        :label="$t('desktop_lyric__lrc_active_zoom_on')"
        @update:model-value="updateSetting({ 'desktopLyric.style.isZoomActiveLrc': $event })")

  UiSettingSection(:title="$t('setting__desktop_lyric_font_weight')")
    .flex.flex-wrap.gap-3.py-1
      UiCheckbox(
        id="setting_setting__desktop_lyric_font_weight_font"
        :model-value="appSetting['desktopLyric.style.isFontWeightFont']"
        :label="$t('setting__desktop_lyric_font_weight_font')"
        @update:model-value="updateSetting({ 'desktopLyric.style.isFontWeightFont': $event })")
      UiCheckbox(
        id="setting_setting__desktop_lyric_font_weight_line"
        :model-value="appSetting['desktopLyric.style.isFontWeightLine']"
        :label="$t('setting__desktop_lyric_font_weight_line')"
        @update:model-value="updateSetting({ 'desktopLyric.style.isFontWeightLine': $event })")
      UiCheckbox(
        id="setting_setting__desktop_lyric_font_weight_extended"
        :model-value="appSetting['desktopLyric.style.isFontWeightExtended']"
        :label="$t('setting__desktop_lyric_font_weight_extended')"
        @update:model-value="updateSetting({ 'desktopLyric.style.isFontWeightExtended': $event })")

  UiSettingSection(:title="$t('setting__desktop_lyric_direction')")
    .flex.flex-wrap.gap-3.py-1
      UiCheckbox(
        id="setting_desktop_lyric_direction_horizontal"
        :model-value="appSetting['desktopLyric.direction']" need value="horizontal"
        :label="$t('setting__desktop_lyric_direction_horizontal')"
        @update:model-value="updateSetting({ 'desktopLyric.direction': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_direction_vertical"
        :model-value="appSetting['desktopLyric.direction']" need value="vertical"
        :label="$t('setting__desktop_lyric_direction_vertical')"
        @update:model-value="updateSetting({ 'desktopLyric.direction': $event })")

  UiSettingSection(:title="$t('setting__desktop_lyric_scroll_align')")
    .flex.flex-wrap.gap-3.py-1
      UiCheckbox(
        id="setting_desktop_lyric_scroll_align_top"
        :model-value="appSetting['desktopLyric.scrollAlign']" need value="top"
        :label="$t('setting__desktop_lyric_scroll_align_top')"
        @update:model-value="updateSetting({ 'desktopLyric.scrollAlign': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_scroll_align_center"
        :model-value="appSetting['desktopLyric.scrollAlign']" need value="center"
        :label="$t('setting__desktop_lyric_scroll_align_center')"
        @update:model-value="updateSetting({ 'desktopLyric.scrollAlign': $event })")

  UiSettingSection(:title="$t('setting__desktop_lyric_align')")
    .flex.flex-wrap.gap-3.py-1
      UiCheckbox(
        id="setting_desktop_lyric_align_left"
        :model-value="appSetting['desktopLyric.style.align']" need value="left"
        :label="$t('setting__desktop_lyric_align_left')"
        @update:model-value="updateSetting({ 'desktopLyric.style.align': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_align_center"
        :model-value="appSetting['desktopLyric.style.align']" need value="center"
        :label="$t('setting__desktop_lyric_align_center')"
        @update:model-value="updateSetting({ 'desktopLyric.style.align': $event })")
      UiCheckbox(
        id="setting_desktop_lyric_align_right"
        :model-value="appSetting['desktopLyric.style.align']" need value="right"
        :label="$t('setting__desktop_lyric_align_right')"
        @update:model-value="updateSetting({ 'desktopLyric.style.align': $event })")

  UiSettingSection(:title="$t('setting__desktop_lyric_line_gap', { num: appSetting['desktopLyric.style.lineGap'] })")
    .flex.items-center.gap-2.py-1
      UiButton(size="sm" variant="secondary" @click="changeLineGap(-1)")
        | {{ $t('setting__desktop_lyric_line_gap_dec') }}
      UiButton(size="sm" variant="secondary" @click="changeLineGap(1)")
        | {{ $t('setting__desktop_lyric_line_gap_add') }}

  UiSettingSection(:title="$t('setting__desktop_lyric_color')")
    .flex.flex-col.gap-2.py-1
      .flex.flex-wrap.gap-4
        .flex.flex-col.items-center.gap-1
          div(ref="lyric_unplay_color_ref" class="h-12 w-12 rounded-[8px] cursor-pointer transition-colors")
          span(class="text-[11px] text-t3") {{ $t('setting__desktop_lyric_unplay_color') }}
        .flex.flex-col.items-center.gap-1
          div(ref="lyric_played_color_ref" class="h-12 w-12 rounded-[8px] cursor-pointer transition-colors")
          span(class="text-[11px] text-t3") {{ $t('setting__desktop_lyric_played_color') }}
        .flex.flex-col.items-center.gap-1
          div(ref="lyric_shadow_color_ref" class="h-12 w-12 rounded-[8px] cursor-pointer transition-colors")
          span(class="text-[11px] text-t3") {{ $t('setting__desktop_lyric_shadow_color') }}
      div
        UiButton(size="sm" variant="secondary" @click="resetColor")
          | {{ $t('setting__desktop_lyric_color_reset') }}

  UiSettingSection(:title="$t('setting__desktop_lyric_font')")
    .flex.items-center.gap-2.py-1
      UiSelect(
        :model-value="appSetting['desktopLyric.style.font']"
        :list="fontList"
        item-key="id" item-name="label"
        @change="updateSetting({ 'desktopLyric.style.font': $event })")

  UiSettingSection(:title="$t('setting__desktop_lyric_reset')")
    .flex.items-center.gap-2.py-1
      UiButton(size="sm" variant="secondary" @click="resetWindowSetting")
        | {{ $t('setting__desktop_lyric_reset_window') }}
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from '@common/utils/vueTools'
import { getSystemFonts } from '@renderer/utils/ipc'
import { isLinux } from '@common/utils'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { useI18n } from '@renderer/plugins/i18n'
import { pickrTools } from '@renderer/utils/pickrTools'

import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UiButton from '@renderer/ui/primitives/UiButton.vue'
import UiSelect from '@renderer/ui/primitives/UiSelect.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'

const defaultUnplayColors = [
  'rgba(255, 255, 255, 1)',
  'rgba(255, 236, 144, 1)',
  'rgba(144, 255, 206, 1)',
  'rgba(32, 255, 132, 1)',
  'rgba(255, 226, 32, 1)',
  'rgba(57, 203, 255, 1)',
  'rgba(217, 57, 255, 1)',
  'rgba(255, 57, 71, 1)',
]
const defaultPlayedColors = [
  'rgba(255, 236, 144, 1)',
  'rgba(144, 255, 206, 1)',
  'rgba(32, 255, 132, 1)',
  'rgba(255, 226, 32, 1)',
  'rgba(57, 203, 255, 1)',
  'rgba(7, 197, 86, 1)',
  'rgba(25, 181, 254, 1)',
  'rgba(217, 57, 255, 1)',
  'rgba(255, 57, 71, 1)',
]
const defaultShadowColors = [
  'rgba(0, 0, 0, 0.15)',
]

const useLyricUnplayColor = () => {
  const lyric_unplay_color_ref = ref(null)
  let tools

  const initLyricUnplayColor = (color, changed, reset) => {
    if (!lyric_unplay_color_ref.value) return
    tools = pickrTools.create(lyric_unplay_color_ref.value, color, defaultUnplayColors, changed, reset)
  }
  const destroyLyricUnplayColor = () => {
    if (!tools) return
    tools.destroy()
    tools = null
  }
  const setLyricUnplayColor = (color) => {
    tools?.setColor(color)
  }

  return {
    lyric_unplay_color_ref,
    initLyricUnplayColor,
    destroyLyricUnplayColor,
    setLyricUnplayColor,
  }
}

const useLyricPlayedColor = () => {
  const lyric_played_color_ref = ref(null)
  let tools

  const initLyricPlayedColor = (color, changed, reset) => {
    if (!lyric_played_color_ref.value) return
    tools = pickrTools.create(lyric_played_color_ref.value, color, defaultPlayedColors, changed, reset)
  }
  const destroyLyricPlayedColor = () => {
    if (!tools) return
    tools.destroy()
    tools = null
  }
  const setLyricPlayedColor = (color) => {
    tools?.setColor(color)
  }

  return {
    lyric_played_color_ref,
    initLyricPlayedColor,
    destroyLyricPlayedColor,
    setLyricPlayedColor,
  }
}

const useLyricShadowColor = () => {
  const lyric_shadow_color_ref = ref(null)
  let tools

  const initLyricShadowColor = (color, changed, reset) => {
    if (!lyric_shadow_color_ref.value) return
    tools = pickrTools.create(lyric_shadow_color_ref.value, color, defaultShadowColors, changed, reset)
  }
  const destroyLyricShadowColor = () => {
    if (!tools) return
    tools.destroy()
    tools = null
  }
  const setLyricShadowColor = (color) => {
    tools?.setColor(color)
  }

  return {
    lyric_shadow_color_ref,
    initLyricShadowColor,
    destroyLyricShadowColor,
    setLyricShadowColor,
  }
}

const useLyricColor = () => {
  const { lyric_unplay_color_ref, initLyricUnplayColor, destroyLyricUnplayColor, setLyricUnplayColor } = useLyricUnplayColor()
  const { lyric_played_color_ref, initLyricPlayedColor, destroyLyricPlayedColor, setLyricPlayedColor } = useLyricPlayedColor()
  const { lyric_shadow_color_ref, initLyricShadowColor, destroyLyricShadowColor, setLyricShadowColor } = useLyricShadowColor()

  const initColors = () => {
    initLyricUnplayColor(appSetting['desktopLyric.style.lyricUnplayColor'], (color) => {
      updateSetting({ 'desktopLyric.style.lyricUnplayColor': color })
    })
    initLyricPlayedColor(appSetting['desktopLyric.style.lyricPlayedColor'], (color) => {
      updateSetting({ 'desktopLyric.style.lyricPlayedColor': color })
    })
    initLyricShadowColor(appSetting['desktopLyric.style.lyricShadowColor'], (color) => {
      updateSetting({ 'desktopLyric.style.lyricShadowColor': color })
    })
  }

  const destroyColors = () => {
    destroyLyricUnplayColor()
    destroyLyricPlayedColor()
    destroyLyricShadowColor()
  }

  const resetColor = () => {
    const defaultSetting = {
      'desktopLyric.style.lyricUnplayColor': 'rgba(255, 255, 255, 1)',
      'desktopLyric.style.lyricPlayedColor': 'rgba(7, 197, 86, 1)',
      'desktopLyric.style.lyricShadowColor': 'rgba(0, 0, 0, 0.18)',
    }
    updateSetting(defaultSetting)
    setLyricUnplayColor(defaultSetting['desktopLyric.style.lyricUnplayColor'])
    setLyricPlayedColor(defaultSetting['desktopLyric.style.lyricPlayedColor'])
    setLyricShadowColor(defaultSetting['desktopLyric.style.lyricShadowColor'])
  }

  onMounted(() => {
    initColors()
  })
  onBeforeUnmount(() => {
    destroyColors()
  })

  return {
    lyric_unplay_color_ref,
    lyric_played_color_ref,
    lyric_shadow_color_ref,
    resetColor,
  }
}

export default {
  name: 'SettingDesktopLyric',
  components: { UiCheckbox, UiButton, UiSelect, UiSettingSection },
  setup() {
    const t = useI18n()

    const changeLineGap = (step) => {
      let gap = appSetting['desktopLyric.style.lineGap'] + step
      updateSetting({ 'desktopLyric.style.lineGap': Math.min(Math.max(gap, 0), 25) })
    }

    const {
      lyric_unplay_color_ref,
      lyric_played_color_ref,
      lyric_shadow_color_ref,
      resetColor,
    } = useLyricColor()

    const systemFontList = ref([])
    const fontList = computed(() => {
      return [{ id: '', label: t('setting__desktop_lyric_font_default') }, ...systemFontList.value]
    })
    void getSystemFonts().then(fonts => {
      systemFontList.value = fonts.map(f => ({ id: f, label: f.replace(/(^"|"$)/g, '') }))
    })

    const resetWindowSetting = () => {
      updateSetting({
        'desktopLyric.width': 450,
        'desktopLyric.height': 300,
        'desktopLyric.x': null,
        'desktopLyric.y': null,
      })
    }

    return {
      appSetting,
      updateSetting,
      changeLineGap,
      lyric_unplay_color_ref,
      lyric_played_color_ref,
      lyric_shadow_color_ref,
      resetColor,
      resetWindowSetting,

      fontList,
      isLinux,
    }
  },
}
</script>
