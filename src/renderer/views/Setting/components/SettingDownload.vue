<template lang="pug">
.setting-panel
  UiSettingSection(:title="$t('setting__download')")
    .flex.flex-col.gap-1.py-1
      UiCheckbox(
        id="setting_download_enable"
        :model-value="appSetting['download.enable']"
        :label="$t('setting__download_enable')"
        @update:model-value="updateSetting({'download.enable': $event})")
      UiCheckbox(
        id="setting_download_skip_exist_file"
        :model-value="appSetting['download.skipExistFile']"
        :label="$t('setting__download_skip_exist_file')"
        @update:model-value="updateSetting({'download.skipExistFile': $event})")
      UiCheckbox(
        id="setting_download_save_group_list_name"
        :model-value="appSetting['download.isSavePathGroupByListName']"
        :label="$t('setting_download_save_group_list_name')"
        @update:model-value="updateSetting({'download.isSavePathGroupByListName': $event})")

  UiSettingSection(:title="$t('setting__download_path')")
    .flex.flex-col.gap-2.py-1
      div(class="text-[12.5px] text-t3")
        | {{ $t('setting__download_path_label') }}
        span(
          class="text-fg hover:underline cursor-pointer ml-1"
          :aria-label="$t('setting__download_path_open_label')"
          @click="openDirInExplorer(appSetting['download.savePath'])")
          | {{ appSetting['download.savePath'] }}
      div
        UiButton(size="sm" variant="secondary" @click="handleChangeSavePath")
          | {{ $t('setting__download_path_change_btn') }}

  UiSettingSection(:title="$t('setting__download_max_num')")
    .flex.items-center.gap-2.py-1
      UiSelect(
        :model-value="appSetting['download.maxDownloadNum']"
        :list="maxNums"
        item-key="id" item-name="id"
        @change="handleUpdateMaxNum")

  UiSettingSection(:title="$t('setting__download_use_other_source')")
    .flex.flex-col.gap-1.py-1
      UiCheckbox(
        id="setting_download_isUseOtherSource"
        :model-value="appSetting['download.isUseOtherSource']"
        :label="$t('setting__is_enable')"
        @update:model-value="updateSetting({'download.isUseOtherSource': $event})")

  UiSettingSection(:title="$t('setting__download_name')")
    .flex.flex-wrap.gap-3.py-1
      UiCheckbox(
        v-for="item in musicNames" :id="`setting_download_musicName_${item.value}`" :key="item.value"
        name="setting_download_musicName" :value="item.value"
        need :model-value="appSetting['download.fileName']" :label="item.name"
        @update:model-value="updateSetting({'download.fileName': $event})")

  UiSettingSection(:title="$t('setting__download_data_embed')")
    .flex.flex-col.gap-1.py-1
      UiCheckbox(
        id="setting_download_isEmbedPic"
        :model-value="appSetting['download.isEmbedPic']"
        :label="$t('setting__download_embed_pic')"
        @update:model-value="updateSetting({'download.isEmbedPic': $event})")
      UiCheckbox(
        id="setting_download_isEmbedLyric"
        :model-value="appSetting['download.isEmbedLyric']"
        :label="$t('setting__download_embed_lyric')"
        @update:model-value="updateSetting({'download.isEmbedLyric': $event})")
      UiCheckbox(
        id="setting_download_isEmbedLyricT"
        :disabled="!appSetting['download.isEmbedLyric']"
        :model-value="appSetting['download.isEmbedLyricT']"
        :label="$t('setting__download_embed_tlyric')"
        @update:model-value="updateSetting({'download.isEmbedLyricT': $event})")
      UiCheckbox(
        id="setting_download_isEmbedLyricR"
        :disabled="!appSetting['download.isEmbedLyric']"
        :model-value="appSetting['download.isEmbedLyricR']"
        :label="$t('setting__download_embed_rlyric')"
        @update:model-value="updateSetting({'download.isEmbedLyricR': $event})")
      UiCheckbox(
        id="setting_download_isEmbedLyricLx"
        :disabled="!appSetting['download.isEmbedLyric']"
        :model-value="appSetting['download.isEmbedLyricLx']"
        :label="$t('setting__download_embed_lxlyric')"
        @update:model-value="updateSetting({'download.isEmbedLyricLx': $event})")

  UiSettingSection(:title="$t('setting__download_lyric')")
    .flex.flex-col.gap-1.py-1
      UiCheckbox(
        id="setting_download_isDownloadLrc"
        :model-value="appSetting['download.isDownloadLrc']"
        :label="$t('setting__is_enable')"
        @update:model-value="updateSetting({'download.isDownloadLrc': $event})")
      UiCheckbox(
        id="setting_download_isDownloadTLrc"
        :disabled="!appSetting['download.isDownloadLrc']"
        :model-value="appSetting['download.isDownloadTLrc']"
        :label="$t('setting__download_tlyric')"
        @update:model-value="updateSetting({'download.isDownloadTLrc': $event})")
      UiCheckbox(
        id="setting_download_isDownloadRLrc"
        :disabled="!appSetting['download.isDownloadLrc']"
        :model-value="appSetting['download.isDownloadRLrc']"
        :label="$t('setting__download_rlyric')"
        @update:model-value="updateSetting({'download.isDownloadRLrc': $event})")
      UiCheckbox(
        id="setting_download_isDownloadLxLrc"
        :disabled="!appSetting['download.isDownloadLrc']"
        :model-value="appSetting['download.isDownloadLxLrc']"
        :label="$t('setting__download_lxlyric')"
        @update:model-value="updateSetting({'download.isDownloadLxLrc': $event})")

  UiSettingSection(:title="$t('setting__download_lyric_format')")
    .flex.flex-wrap.gap-3.py-1
      UiCheckbox(
        v-for="item in lrcFormatList" :id="`setting_download_lrcFormat_${item.id}`" :key="item.id"
        name="setting_download_lrcFormat" need :model-value="appSetting['download.lrcFormat']" :value="item.id" :label="item.name"
        @update:model-value="updateSetting({'download.lrcFormat': $event})")
</template>

<script>
import { computed } from '@common/utils/vueTools'
import { showSelectDialog, openDirInExplorer } from '@renderer/utils/ipc'
import { useI18n } from '@renderer/plugins/i18n'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { dialog } from '@renderer/plugins/Dialog'

import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UiButton from '@renderer/ui/primitives/UiButton.vue'
import UiSelect from '@renderer/ui/primitives/UiSelect.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'

export default {
  name: 'SettingDownload',
  components: { UiCheckbox, UiButton, UiSelect, UiSettingSection },
  setup() {
    const t = useI18n()

    const handleChangeSavePath = () => {
      void showSelectDialog({
        title: t('setting__download_select_save_path'),
        defaultPath: appSetting['download.savePath'],
        properties: ['openDirectory'],
      }).then(result => {
        if (result.canceled) return
        updateSetting({ 'download.savePath': result.filePaths[0] })
      })
    }

    const maxNums = new Array(6).fill(null).map((_, i) => ({ id: i + 1 }))
    const handleUpdateMaxNum = async({ id }) => {
      if (id > 3) {
        if (!await dialog.confirm(window.i18n.t('setting__download_max_num_tip'))) return
      }
      updateSetting({ 'download.maxDownloadNum': id })
    }

    const musicNames = computed(() => {
      return [
        { value: '歌名 - 歌手', name: t('setting__download_name1') },
        { value: '歌手 - 歌名', name: t('setting__download_name2') },
        { value: '歌名', name: t('setting__download_name3') },
      ]
    })

    const lrcFormatList = computed(() => {
      return [
        { id: 'utf8', name: t('setting__download_lyric_format_utf8') },
        { id: 'gbk', name: t('setting__download_lyric_format_gbk') },
      ]
    })

    return {
      appSetting,
      updateSetting,
      openDirInExplorer,
      handleChangeSavePath,
      musicNames,
      lrcFormatList,
      maxNums,
      handleUpdateMaxNum,
    }
  },
}
</script>
