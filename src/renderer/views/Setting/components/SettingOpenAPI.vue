<template lang="pug">
.setting-panel
  UiSettingSection(:title="$t('setting__open_api')")
    .flex.flex-col.gap-2.py-1
      UiCheckbox(
        id="setting_open_api_enable"
        :model-value="appSetting['openAPI.enable']"
        :label="$t('setting__open_api_enable')"
        @update:model-value="updateSetting({ 'openAPI.enable': $event })")
      UiCheckbox(
        id="setting_open_api_bind_lan"
        :model-value="appSetting['openAPI.bindLan']"
        :label="$t('setting__open_api_bind_lan')"
        @update:model-value="updateSetting({ 'openAPI.bindLan': $event })")
      div(class="text-[12.5px] text-t3")
        | {{ $t('setting__open_api_address') }}
        span.text-fg.ml-1 {{ openAPI.address }}
      div(
        v-if="openAPI.message"
        class="text-[12.5px] text-t3") {{ openAPI.message }}
      div(class="text-[12.5px] text-t3") {{ $t('setting__open_api_port') }}
      UiTextField(
        :model-value="appSetting['openAPI.port']"
        type="number"
        :placeholder="$t('setting__open_api_port_tip')"
        @update:model-value="setPort")

  UiSettingSection
    div(class="text-[12.5px] text-t3 py-1")
      | {{ $t('setting__open_api_tip') }}
      strong(
        class="text-accent hover:underline cursor-pointer ml-1"
        @click="openUrl('https://lyswhut.github.io/lx-music-doc/desktop/open-api')")
        | {{ $t('setting__open_api_tip_link') }}
</template>

<script>
import { openAPI } from '@renderer/store'
import { openUrl } from '@common/utils/electron'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { debounce } from '@common/utils'

import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UiTextField from '@renderer/ui/primitives/UiTextField.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'

export default {
  name: 'SettingOpenAPI',
  components: { UiCheckbox, UiTextField, UiSettingSection },
  setup() {
    const setPort = debounce(port => {
      updateSetting({ 'openAPI.port': port.trim() })
    }, 500)

    return {
      appSetting,
      updateSetting,
      openAPI,
      openUrl,
      setPort,
    }
  },
}
</script>
