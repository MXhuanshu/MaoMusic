<template lang="pug">
.setting-panel
  UiSettingSection(:title="$t('setting__about')")
    div(class="flex flex-col gap-2 py-1 text-[12.5px] text-t3")
      div(class="mb-1 flex items-center gap-3")
        img(:src="logo" class="h-14 w-14 rounded-[12px] ring-1 ring-line" alt="猫仙音乐")
        div
          div(class="text-[15px] font-semibold text-fg") 猫仙音乐
          div(class="mt-0.5 text-[11.5px] text-t3") v{{ version }}
      p
        | 猫仙音乐是免费的本地/在线音乐播放器，界面基于 Folia 视觉语言重做，兼容 LX Music 的音乐源与自定义源。
      p
        | 作者：&nbsp;
        strong.text-fg MXhuanshu（猫仙）
      p
        | 项目主页：&nbsp;
        span(
          class="text-accent hover:underline cursor-pointer"
          :aria-label="$t('setting__click_open')"
          @click="openUrl('https://github.com/MXhuanshu')")
          | https://github.com/MXhuanshu
      p
        | 版本：&nbsp;
        strong.text-fg v{{ version }}
      p
        | 你已签署本软件的
        UiButton.ml-1.mr-1(size="sm" variant="secondary" @click="handleShowPact") 许可协议
        | 。
      p 本项目仅用于学习与研究，请支持正版音乐。
</template>

<script>
import { isShowPact } from '@renderer/store'
import { clipboardWriteText, openUrl } from '@common/utils/electron'
import pkg from '../../../../../package.json'

import logo from '@renderer/assets/images/logo.png'
import UiButton from '@renderer/ui/primitives/UiButton.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'

export default {
  name: 'SettingAbout',
  components: { UiButton, UiSettingSection },
  setup() {
    const handleShowPact = () => {
      isShowPact.value = true
    }
    return {
      version: pkg.version,
      logo,
      openUrl,
      clipboardWriteText,
      handleShowPact,
    }
  },
}
</script>
