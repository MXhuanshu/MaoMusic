<template lang="pug">
.setting-panel
  UiSettingSection(:title="$t('setting__odc')")
    .flex.flex-col.gap-1.py-1
      UiCheckbox(
        id="setting_odc_isAutoClearSearchInput"
        :model-value="appSetting['odc.isAutoClearSearchInput']"
        :label="$t('setting__odc_clear_search_input')"
        @update:model-value="updateSetting({'odc.isAutoClearSearchInput': $event})")
      UiCheckbox(
        id="setting_odc_isAutoClearSearchList"
        :model-value="appSetting['odc.isAutoClearSearchList']"
        :label="$t('setting__odc_clear_search_list')"
        @update:model-value="updateSetting({'odc.isAutoClearSearchList': $event})")
</template>

<script>
import { appSetting, updateSetting } from '@renderer/store/setting'
import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'

export default {
  name: 'SettingOdc',
  components: { UiCheckbox, UiSettingSection },
  setup() {
    return {
      appSetting,
      updateSetting,
    }
  },
}
</script>
