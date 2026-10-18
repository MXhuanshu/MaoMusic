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

    return {
      appSetting,
      updateSetting,
      visualizerOptions,
      backgroundOptions,
      visualizerSupported: isVisualizerSupported(),
    }
  },
}
</script>
