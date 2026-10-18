<template lang="pug">
.setting-panel
  UiSettingSection(:title="$t('setting__list')")
    .flex.flex-col.gap-1.py-1
      UiCheckbox(
        id="setting_list_actionButtonsVisible_enable"
        :model-value="appSetting['list.actionButtonsVisible']"
        :label="$t('setting__list_action_btn')"
        @update:model-value="updateSetting({'list.actionButtonsVisible': $event})")
      UiCheckbox(
        id="setting_list_showSource_enable"
        :model-value="appSetting['list.isShowSource']"
        :label="$t('setting__list_source')"
        @update:model-value="updateSetting({'list.isShowSource': $event})")
      UiCheckbox(
        id="setting_list_scroll_enable"
        :model-value="appSetting['list.isSaveScrollLocation']"
        :label="$t('setting__list_scroll')"
        @update:model-value="updateSetting({'list.isSaveScrollLocation': $event})")
      UiCheckbox(
        id="setting_list_clickAction_enable"
        :model-value="appSetting['list.isClickPlayList']"
        :label="$t('setting__list_click_action')"
        @update:model-value="updateSetting({'list.isClickPlayList': $event})")

  UiSettingSection(:title="$t('setting__list_add_music_location_type')")
    .flex.flex-wrap.gap-3.py-1
      UiCheckbox(
        id="setting_list_add_music_location_type_top" name="setting_list_add_music_location_type" need
        :model-value="appSetting['list.addMusicLocationType']" value="top" :label="$t('setting__list_add_music_location_type_top')"
        @update:model-value="updateSetting({'list.addMusicLocationType': $event})")
      UiCheckbox(
        id="setting_list_add_music_location_type_bottom" name="setting_list_add_music_location_type" need
        :model-value="appSetting['list.addMusicLocationType']" value="bottom" :label="$t('setting__list_add_music_location_type_bottom')"
        @update:model-value="updateSetting({'list.addMusicLocationType': $event})")
</template>

<script>
import { appSetting, updateSetting } from '@renderer/store/setting'
import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'

export default {
  name: 'SettingList',
  components: { UiCheckbox, UiSettingSection },
  setup() {
    return {
      appSetting,
      updateSetting,
    }
  },
}
</script>
