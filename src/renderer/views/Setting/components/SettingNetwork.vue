<template lang="pug">
.setting-panel
  UiSettingSection(:title="$t('setting__network_proxy_title')")
    .flex.flex-col.gap-2.py-1
      UiCheckbox(
        id="setting_network_proxy_enable"
        :model-value="appSetting['network.proxy.enable']"
        :label="$t('setting__is_enable')"
        @update:model-value="updateSetting({'network.proxy.enable': $event})")
      UiTextField(
        :model-value="appSetting['network.proxy.host']"
        :placeholder="proxy.envProxy ? proxy.envProxy.host : $t('setting__network_proxy_host')"
        @update:model-value="setHost")
      UiTextField(
        :model-value="appSetting['network.proxy.port']"
        :placeholder="proxy.envProxy ? proxy.envProxy.port : $t('setting__network_proxy_port')"
        @update:model-value="setPort")
</template>

<script>
import { onBeforeUnmount } from '@common/utils/vueTools'
import { proxy } from '@renderer/store'
import { debounce } from '@common/utils'

import { appSetting, updateSetting } from '@renderer/store/setting'
import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UiTextField from '@renderer/ui/primitives/UiTextField.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'

export default {
  name: 'SettingNetwork',
  components: { UiCheckbox, UiTextField, UiSettingSection },
  setup() {
    const setHost = debounce(host => {
      updateSetting({ 'network.proxy.host': host.trim() })
    }, 500)
    const setPort = debounce(port => {
      updateSetting({ 'network.proxy.port': port.trim() })
    }, 500)

    onBeforeUnmount(() => {
      if (appSetting['network.proxy.enable'] && !appSetting['network.proxy.host']) proxy.enable = false
    })

    return {
      appSetting,
      updateSetting,
      setHost,
      setPort,
      proxy,
    }
  },
}
</script>
