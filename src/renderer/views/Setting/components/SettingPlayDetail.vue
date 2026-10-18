<template lang="pug">
.setting-panel
  UiSettingSection(:title="$t('setting__play_detail')")
    .flex.flex-col.gap-1.py-1
      UiCheckbox(
        id="setting_play_detail_font_zoom_enable"
        :model-value="appSetting['playDetail.isZoomActiveLrc']"
        :label="$t('setting__play_detail_font_zoom')"
        @update:model-value="updateSetting({'playDetail.isZoomActiveLrc': $event})")
      UiCheckbox(
        id="setting_play_detail_lyric_delayScroll"
        :model-value="appSetting['playDetail.isDelayScroll']"
        :label="$t('setting__play_detail_lyric_delay_scroll')"
        @update:model-value="updateSetting({ 'playDetail.isDelayScroll': $event })")
      UiCheckbox(
        id="setting_play_detail_lyric_progress_enable"
        :model-value="appSetting['playDetail.isShowLyricProgressSetting']"
        :label="$t('setting__play_detail_lyric_progress')"
        @update:model-value="updateSetting({'playDetail.isShowLyricProgressSetting': $event})")

  UiSettingSection(:title="$t('setting__play_detail_visualizer')")
    div(class="flex flex-wrap items-center justify-between gap-3 py-1")
      div(class="min-w-0")
        div(class="text-[13px] leading-snug text-fg") {{ $t('setting__play_detail_visualizer') }}
        div(class="mt-1 text-[11.5px] leading-relaxed text-t3") {{ $t('setting__play_detail_visualizer_desc') }}
        div(v-if="!visualizerSupported" class="mt-1 text-[11.5px] leading-relaxed text-warn")
          | {{ $t('setting__play_detail_visualizer_unsupported') }}
      UiSegmented(
        :list="visualizerOptions"
        :model-value="appSetting['playDetail.visualizer']"
        @update:model-value="updateSetting({'playDetail.visualizer': $event})")

  UiSettingSection(:title="$t('setting__play_detail_background')")
    div(class="flex flex-wrap items-center justify-between gap-3 py-1")
      div(class="min-w-0")
        div(class="text-[13px] leading-snug text-fg") {{ $t('setting__play_detail_background') }}
        div(class="mt-1 text-[11.5px] leading-relaxed text-t3") {{ $t('setting__play_detail_background_desc') }}
      UiSegmented(
        :list="backgroundOptions"
        :model-value="appSetting['playDetail.background']"
        @update:model-value="updateSetting({'playDetail.background': $event})")

  UiSettingSection(title="Folia 歌词视觉")
    div(class="flex flex-wrap items-center justify-between gap-3 py-1")
      div(class="min-w-0")
        div(class="text-[13px] leading-snug text-fg") 歌词视觉模式
        div(class="mt-1 text-[11.5px] leading-relaxed text-t3") 来自 Folia 的 14 种沉浸式歌词舞台，切换后立即生效
      UiSelect(
        :list="foliaModeOptions"
        :model-value="appSetting['playDetail.visualizerMode']"
        @update:model-value="updateSetting({'playDetail.visualizerMode': $event})")

    div(class="flex flex-wrap items-center justify-between gap-3 py-1")
      div(class="min-w-0")
        div(class="text-[13px] leading-snug text-fg") 背景模式
        div(class="mt-1 text-[11.5px] leading-relaxed text-t3") 星野 / 潜影 / 莫奈 / 游牧 / 通用 / 自定义
      UiSelect(
        :list="foliaBackgroundOptions"
        :model-value="appSetting['playDetail.backgroundMode']"
        @update:model-value="updateSetting({'playDetail.backgroundMode': $event})")

  UiSettingSection(:title="$t('setting__play_detail_align')")
    .flex.flex-wrap.gap-3.py-1
      UiCheckbox(
        id="setting_play_detail_align_left"
        :model-value="appSetting['playDetail.style.align']" need value="left"
        :label="$t('setting__play_detail_align_left')"
        @update:model-value="updateSetting({ 'playDetail.style.align': $event })")
      UiCheckbox(
        id="setting_play_detail_align_center"
        :model-value="appSetting['playDetail.style.align']" need value="center"
        :label="$t('setting__play_detail_align_center')"
        @update:model-value="updateSetting({ 'playDetail.style.align': $event })")
      UiCheckbox(
        id="setting_play_detail_align_right"
        :model-value="appSetting['playDetail.style.align']" need value="right"
        :label="$t('setting__play_detail_align_right')"
        @update:model-value="updateSetting({ 'playDetail.style.align': $event })")
</template>

<script>
import { computed } from '@common/utils/vueTools'
import { useI18n } from '@renderer/plugins/i18n'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { isVisualizerSupported } from '@renderer/ui/features/visualizer/useVisualizerMode'
import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UiSegmented from '@renderer/ui/primitives/UiSegmented.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'

export default {
  name: 'SettingPlayDetail',
  components: { UiCheckbox, UiSegmented, UiSettingSection },
  setup() {
    const t = useI18n()
    const visualizerOptions = computed(() => [
      { id: 'off', label: t('setting__play_detail_visualizer_off') },
      { id: 'lite', label: t('setting__play_detail_visualizer_lite') },
      { id: 'full', label: t('setting__play_detail_visualizer_full') },
    ])
    const backgroundOptions = computed(() => [
      { id: 'mosaic', label: t('setting__play_detail_background_mosaic') },
      { id: 'starfield', label: t('setting__play_detail_background_starfield') },
    ])
    // Folia 原码注册的 14 种歌词视觉模式
    const foliaModeOptions = computed(() => [
      { id: 'classic', label: '经典' },
      { id: 'cadenza', label: '华彩' },
      { id: 'cappella', label: '阿卡贝拉' },
      { id: 'claddagh', label: '克拉达' },
      { id: 'diorama', label: '立体景' },
      { id: 'fume', label: '烟雾' },
      { id: 'lumiere', label: '光晕' },
      { id: 'monet', label: '莫奈' },
      { id: 'partita', label: '帕蒂塔' },
      { id: 'pendolo', label: '摆钟' },
      { id: 'sonnet', label: '十四行诗' },
      { id: 'still', label: '静物' },
      { id: 'tempera', label: '蛋彩' },
      { id: 'tilt', label: '倾斜' },
    ])
    // Folia 原码注册的 6 种背景模式
    const foliaBackgroundOptions = computed(() => [
      { id: 'sora', label: '星野' },
      { id: 'latent', label: '潜影' },
      { id: 'monet', label: '莫奈' },
      { id: 'nomand', label: '游牧' },
      { id: 'common', label: '通用' },
      { id: 'url', label: '自定义' },
    ])

    return {
      appSetting,
      updateSetting,
      visualizerOptions,
      backgroundOptions,
      foliaModeOptions,
      foliaBackgroundOptions,
      visualizerSupported: isVisualizerSupported(),
    }
  },
}
</script>
