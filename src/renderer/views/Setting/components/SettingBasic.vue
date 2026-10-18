<template lang="pug">
div.setting-panel
  UiSettingSection(:title="$t('setting__basic')")
    UiSwitch(
      :model-value="appSetting['common.isShowAnimation']"
      :label="$t('setting__basic_show_animation')"
      @update:model-value="updateSetting({'common.isShowAnimation': $event})")
    UiSwitch(
      :model-value="appSetting['common.randomAnimate']"
      :label="$t('setting__basic_animation')"
      @update:model-value="updateSetting({'common.randomAnimate': $event})")
    UiSwitch(
      :model-value="appSetting['common.startInFullscreen']"
      :label="$t('setting__basic_start_in_fullscreen')"
      @update:model-value="updateSetting({'common.startInFullscreen': $event})")
    UiSwitch(
      :model-value="appSetting['tray.enable']"
      :label="$t('setting__basic_to_tray')"
      @update:model-value="updateSetting({'tray.enable': $event})")

    .mt-3
      UiButton(size="sm" variant="secondary" @click="isShowPlayTimeoutModal = true")
        | {{ $t('setting__play_timeout') }}{{ timeLabel ? ` (${timeLabel})` : '' }}

  UiSettingSection(:title="$t('setting__basic_theme')")
    div(class="flex flex-wrap items-center justify-between gap-3 py-1")
      div(class="min-w-0")
        div(class="text-[13px] leading-snug text-fg") {{ $t('setting__theme_mode') }}
        div(class="mt-1 text-[11.5px] leading-relaxed text-t3") {{ $t('setting__theme_mode_desc') }}
      UiSegmented(
        :list="themeModeList"
        :model-value="appSetting['theme.mode']"
        @update:model-value="updateSetting({'theme.mode': $event})")

    UiSwitch(
      :model-value="appSetting['theme.source'] !== 'static'"
      :label="$t('setting__theme_follow_cover')"
      :description="$t('setting__theme_follow_cover_desc')"
      @update:model-value="setFollowCover")

    div(class="mt-3 flex flex-wrap items-center gap-3")
      span(class="text-[11.5px] text-t3") {{ $t('setting__theme_palette') }}
      div(class="flex items-center gap-1.5")
        span(
          v-for="(color, index) in paletteColors"
          :key="index"
          class="h-4 w-4 rounded-full ring-1 ring-inset ring-white/15"
          :style="{ backgroundColor: color }"
          :title="color")
      span(v-if="isFallbackTheme" class="text-[11.5px] text-t3") {{ $t('setting__theme_fallback') }}
      UiButton(
        class="ml-auto"
        size="sm"
        variant="secondary"
        :disabled="isExtractingTheme"
        @click="handleRefreshCoverTheme")
        RefreshCw(:size="13" :stroke-width="2" :class="{ 'animate-spin': isExtractingTheme }")
        span {{ $t('setting__theme_refresh') }}

  UiSettingSection(:title="$t('setting__basic_source')")
    .flex.flex-col
      .v-for v-for="item in apiSources" :key="item.id"
        UiCheckbox(
          :id="`setting_api_source_${item.id}`"
          name="setting_api_source"
          need
          :model-value="appSetting['common.apiSource']"
          :disabled="item.disabled"
          :value="item.id"
          :aria-label="item.label"
          @update:model-value="updateSetting({'common.apiSource': $event})")
        span.source-line
          | {{ item.name }}
          span.desc(v-if="item.desc") {{ item.desc }}
          span.status(v-if="item.statusLabel") {{ item.statusLabel }}
    .mt-3
      UiButton(size="sm" variant="secondary" @click="isShowUserApiModal = true")
        | 管理自定义源 / 导入音乐源

  UiSettingSection(:title="$t('setting__basic_window_size')")
    .flex.flex-wrap.gap-x-5.gap-y-1
      .v-for v-for="item in windowSizeList" :key="item.id"
        UiCheckbox(
          :id="`setting_window_size_${item.id}`"
          name="setting_window_size"
          need
          :model-value="appSetting['common.windowSizeId']"
          :disabled="isFullscreen"
          :value="item.id"
          :label="$t('setting__basic_window_size_' + item.name)"
          @update:model-value="updateSetting({'common.windowSizeId': $event})")

  UiSettingSection(:title="$t('setting__basic_font_size')")
    .flex.flex-wrap.gap-x-5.gap-y-1
      .v-for v-for="item in fontSizeList" :key="item.id"
        UiCheckbox(
          :id="`setting_basic_font_size_${item.id}`"
          name="setting_basic_font_size"
          need
          :model-value="appSetting['common.fontSize']"
          :value="item.id"
          :label="item.label"
          :disabled="isFullscreen"
          @update:model-value="updateSetting({'common.fontSize': $event})")

  UiSettingSection(:title="$t('setting__basic_font')")
    .flex.flex-wrap.items-center.gap-3(style="--selection-width: 12rem;")
      UiSelect(:list="fontList" :model-value="fonts[0]" item-key="id" item-name="label" @update:model-value="updateFonts($event, fonts[1])")
      UiSelect(v-if="fonts[0]" :list="fontList" :model-value="fonts[1]" item-key="id" item-name="label" @update:model-value="updateFonts(fonts[0], $event)")

  UiSettingSection(:title="$t('setting__basic_lang')")
    .flex.flex-wrap.gap-x-5.gap-y-1
      .v-for v-for="item in langList" :key="item.locale"
        UiCheckbox(
          :id="`setting_lang_${item.locale}`"
          name="setting_lang"
          need
          :model-value="appSetting['common.langId']"
          :value="item.locale"
          :label="item.name"
          @update:model-value="updateSetting({'common.langId': $event})")

  UiSettingSection(:title="$t('setting__basic_sourcename')")
    .flex.flex-wrap.gap-x-5.gap-y-1
      .v-for v-for="item in sourceNameTypes" :key="item.id"
        UiCheckbox(
          :id="`setting_basic_sourcename_${item.id}`"
          name="setting_basic_sourcename"
          need
          :model-value="appSetting['common.sourceNameType']"
          :value="item.id"
          :label="item.label"
          @update:model-value="updateSetting({'common.sourceNameType': $event})")

  UiSettingSection(:title="$t('setting__basic_control_btn_position')")
    .flex.flex-wrap.gap-x-5.gap-y-1
      .v-for v-for="item in controlBtnPositionList" :key="item.id"
        UiCheckbox(
          :id="`setting_basic_control_btn_position_${item.id}`"
          name="setting_basic_control_btn_position"
          need
          :model-value="appSetting['common.controlBtnPosition']"
          :value="item.id"
          :label="item.name"
          @update:model-value="updateSetting({'common.controlBtnPosition': $event})")

  UiSettingSection(:title="$t('setting__basic_playbar_progress_style')")
    .flex.flex-wrap.gap-x-5.gap-y-1
      UiCheckbox(
        id="setting_basic_playbar_progress_style_mini" name="setting_basic_playbar_progress_style"
        need
        :model-value="appSetting['common.playBarProgressStyle']"
        value="mini"
        :label="$t('setting__basic_playbar_progress_style_mini')"
        @update:model-value="updateSetting({'common.playBarProgressStyle': $event})")
      UiCheckbox(
        id="setting_basic_playbar_progress_style_middle" name="setting_basic_playbar_progress_style"
        need
        :model-value="appSetting['common.playBarProgressStyle']"
        value="middle"
        :label="$t('setting__basic_playbar_progress_style_middle')"
        @update:model-value="updateSetting({'common.playBarProgressStyle': $event})")
      UiCheckbox(
        id="setting_basic_playbar_progress_style_full" name="setting_basic_playbar_progress_style"
        need
        :model-value="appSetting['common.playBarProgressStyle']"
        value="full"
        :label="$t('setting__basic_playbar_progress_style_full')"
        @update:model-value="updateSetting({'common.playBarProgressStyle': $event})")

  play-timeout-modal(v-model="isShowPlayTimeoutModal")
  user-api-modal(v-model="isShowUserApiModal")

</template>

<script>
import { computed, ref } from '@common/utils/vueTools'
import { windowSizeList, userApi, isFullscreen } from '@renderer/store'
import { langList, useI18n } from '@root/lang'
import { getSystemFonts } from '@renderer/utils/ipc'
import apiSourceInfo from '@renderer/utils/musicSdk/api-source-info'
import { useTimeout } from '@renderer/core/player/timeoutStop'

import { RefreshCw } from 'lucide-vue-next'
import PlayTimeoutModal from './PlayTimeoutModal.vue'
import UserApiModal from './UserApiModal.vue'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { activeTheme, isExtractingTheme, isFallbackTheme } from '@renderer/core/theme/state'
import { refreshCoverTheme } from '@renderer/core/theme/useCoverTheme'

import UiButton from '@renderer/ui/primitives/UiButton.vue'
import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UiSegmented from '@renderer/ui/primitives/UiSegmented.vue'
import UiSelect from '@renderer/ui/primitives/UiSelect.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'
import UiSwitch from '@renderer/ui/primitives/UiSwitch.vue'

export default {
  name: 'SettingBasic',
  components: {
    RefreshCw,
    PlayTimeoutModal,
    UserApiModal,
    UiButton,
    UiCheckbox,
    UiSegmented,
    UiSelect,
    UiSettingSection,
    UiSwitch,
  },
  setup() {
    const t = useI18n()

    // 主题面板：只看「明暗模式 + 是否跟随封面」，不再维护主题列表与自定义主题
    const themeModeList = computed(() => [
      { id: 'system', label: t('setting__theme_mode_system') },
      { id: 'light', label: t('setting__theme_mode_light') },
      { id: 'dark', label: t('setting__theme_mode_dark') },
    ])

    const paletteColors = computed(() => [
      activeTheme.value.backgroundColor,
      activeTheme.value.primaryColor,
      activeTheme.value.secondaryColor,
      activeTheme.value.accentColor,
    ])

    const setFollowCover = (enable) => {
      updateSetting({ 'theme.source': enable ? 'cover' : 'static' })
    }

    const handleRefreshCoverTheme = () => {
      void refreshCoverTheme()
    }

    const isShowPlayTimeoutModal = ref(false)
    const { timeLabel } = useTimeout()

    const isShowUserApiModal = ref(false)
    const getApiStatus = () => {
      let status
      if (userApi.status) status = t('setting__basic_source_status_success')
      else if (userApi.message == 'initing') status = t('setting__basic_source_status_initing')
      else status = `${t('setting__basic_source_status_failed')}`

      return status
    }
    const apiSources = computed(() => {
      return [
        ...apiSourceInfo.map(api => ({
          id: api.id,
          name: api.name,
          label: api.name,
          disabled: api.disabled,
        })),
        ...userApi.list.map(api => ({
          id: api.id,
          name: api.name,
          label: `${api.name}${api.id == appSetting['common.apiSource'] ? `[${getApiStatus()}]` : ''}`,
          desc: [/^\d/.test(api.version) ? `v${api.version}` : api.version].filter(Boolean).join(', '),
          statusLabel: api.id == appSetting['common.apiSource'] ? `[${getApiStatus()}]` : '',
          status: api.status,
          message: api.message,
          disabled: false,
        })),
      ]
    })

    const sourceNameTypes = computed(() => {
      return [
        { id: 'real', label: t('setting__basic_sourcename_real') },
        { id: 'alias', label: t('setting__basic_sourcename_alias') },
      ]
    })

    const controlBtnPositionList = computed(() => {
      return [
        { id: 'left', name: t('setting__basic_control_btn_position_left') },
        { id: 'right', name: t('setting__basic_control_btn_position_right') },
      ]
    })

    const systemFontList = ref([])
    const fontList = computed(() => {
      return [{ id: '', label: t('setting__desktop_lyric_font_default') }, ...systemFontList.value]
    })
    void getSystemFonts().then(fonts => {
      systemFontList.value = fonts.map(f => ({ id: f, label: f.replace(/(^"|"$)/g, '') }))
    })

    const fonts = computed(() => {
      if (!appSetting['common.font']) return ['', '']
      let [f1 = '', f2 = ''] = appSetting['common.font'].split(',')
      return [f1.trim(), f2.trim()]
    })
    const updateFonts = (font1, font2) => {
      let font = []
      if (font1) font.push(font1)
      if (font2) font.push(font2)
      updateSetting({ 'common.font': font.join(', ') })
    }
    const fontSizeList = computed(() => {
      return [
        { id: 14, label: t('setting__basic_font_size_14px') },
        { id: 15, label: t('setting__basic_font_size_15px') },
        { id: 16, label: t('setting__basic_font_size_16px') },
        { id: 17, label: t('setting__basic_font_size_17px') },
        { id: 18, label: t('setting__basic_font_size_18px') },
        { id: 19, label: t('setting__basic_font_size_19px') },
      ]
    })

    return {
      appSetting,
      updateSetting,
      isFallbackTheme,
      isExtractingTheme,
      themeModeList,
      paletteColors,
      setFollowCover,
      handleRefreshCoverTheme,
      fonts,
      updateFonts,
      isShowPlayTimeoutModal,
      timeLabel,
      apiSources,
      isShowUserApiModal,
      windowSizeList,
      langList,
      sourceNameTypes,
      controlBtnPositionList,
      fontList,
      isFullscreen,
      fontSizeList,
    }
  },
}
</script>

<style lang="less">
@import '@renderer/assets/styles/layout.less';

.setting-panel {
  padding: 0 20px 24px;
}

.source-line {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;

  .desc {
    font-size: 11.5px;
    color: var(--color-font-label);
  }

  .status {
    font-size: 11.5px;
    color: var(--color-primary);
  }
}

:global {
  .v-for { display: inline-flex; }
}
</style>
