<template lang="pug">
.setting-panel
  UiSettingSection(:title="$t('setting__search')")
    .flex.flex-col.gap-1.py-1
      UiCheckbox(
        id="setting_search_showHot_enable"
        :model-value="appSetting['search.isShowHotSearch']"
        :label="$t('setting__search_hot')"
        @update:model-value="updateSetting({'search.isShowHotSearch': $event})")
      UiCheckbox(
        id="setting_search_showHistory_enable"
        :model-value="appSetting['search.isShowHistorySearch']"
        :label="$t('setting__search_history')"
        @update:model-value="updateSetting({'search.isShowHistorySearch': $event})")
      UiCheckbox(
        id="setting_search_focusSearchBox_enable"
        :model-value="appSetting['search.isFocusSearchBox']"
        :label="$t('setting__search_focus_search_box')"
        @update:model-value="updateSetting({'search.isFocusSearchBox': $event})")
</template>

<script>
import { appSetting, updateSetting } from '@renderer/store/setting'
import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'

export default {
  name: 'SettingSearch',
  components: { UiCheckbox, UiSettingSection },
  setup() {
    return {
      appSetting,
      updateSetting,
    }
  },
}
</script>
