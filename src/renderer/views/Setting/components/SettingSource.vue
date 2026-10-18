<template>
  <div class="setting-panel">
    <UiSettingSection title="音乐源">
      <p class="py-1 text-[12px] leading-relaxed text-t3">
        内置音源与导入的自定义源都在这里切换。自定义源兼容 LX Music 的音源脚本格式。
      </p>

      <div class="flex flex-col gap-1 py-1">
        <UiCheckbox
          v-for="item in apiSources"
          :key="item.id"
          :id="`setting_source_${item.id}`"
          name="setting_source"
          need
          :model-value="appSetting['common.apiSource']"
          :disabled="item.disabled"
          :value="item.id"
          :label="item.label"
          @update:model-value="updateSetting({ 'common.apiSource': $event })"
        />
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <UiButton size="sm" variant="primary" @click="handleImportFile">
          <Upload :size="13" :stroke-width="2" />
          从文件导入
        </UiButton>
        <UiButton size="sm" variant="secondary" @click="isShowUserApiModal = true">
          在线导入 / 管理
        </UiButton>
        <span class="text-[11px] text-t3">支持 .js 脚本，导入后出现在上方列表</span>
      </div>

      <div v-if="userApi.list.length" class="mt-4 flex flex-col gap-2">
        <div class="text-[11px] uppercase tracking-wider text-t3">已导入</div>
        <div
          v-for="api in userApi.list"
          :key="api.id"
          class="flex items-center gap-2 rounded-[10px] border border-line bg-fill/40 px-3 py-2"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="truncate text-[12.5px] text-fg">{{ api.name }}</span>
              <span v-if="api.version" class="rounded bg-fill2 px-1.5 py-0.5 text-[10px] text-t3">{{ api.version }}</span>
              <span v-if="appSetting['common.apiSource'] == api.id" class="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent">使用中</span>
            </div>
            <div class="mt-0.5 truncate text-[11px] text-t3">{{ api.author }} {{ api.description }}</div>
          </div>
          <UiButton size="sm" variant="ghost" @click="handleRemove(api.id)">移除</UiButton>
        </div>
      </div>
    </UiSettingSection>

    <UserApiModal v-model="isShowUserApiModal" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from '@common/utils/vueTools'
import { Upload } from 'lucide-vue-next'
import { useI18n } from '@renderer/plugins/i18n'
import { importUserApi, removeUserApi, showSelectDialog } from '@renderer/utils/ipc'
import { readFile } from '@common/utils/nodejs'
import apiSourceInfo from '@renderer/utils/musicSdk/api-source-info'
import { userApi } from '@renderer/store'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { dialog } from '@renderer/plugins/Dialog'
import UiButton from '@renderer/ui/primitives/UiButton.vue'
import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'
import UserApiModal from './UserApiModal.vue'

const t = useI18n()
const isShowUserApiModal = ref(false)

const getApiStatus = () => {
  if (userApi.status) return t('setting__basic_source_status_success')
  if (userApi.message == 'initing') return t('setting__basic_source_status_initing')
  return t('setting__basic_source_status_failed')
}

const apiSources = computed(() => [
  ...apiSourceInfo.map(api => ({
    id: api.id,
    name: api.name,
    label: api.name,
    disabled: api.disabled,
  })),
  ...userApi.list.map(api => ({
    id: api.id,
    name: api.name,
    label: `${api.name}${api.id == appSetting['common.apiSource'] ? ` [${getApiStatus()}]` : ''}`,
    disabled: false,
  })),
])

const handleImportFile = () => {
  void showSelectDialog({
    title: '选择音源脚本',
    properties: ['openFile'],
    filters: [
      { name: 'LX API File', extensions: ['js'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  }).then(async result => {
    if (result.canceled) return
    const data = await readFile(result.filePaths[0])
    await importUserApi(data.toString()).then(({ apiList }) => {
      userApi.list = apiList
    }).catch((err: Error) => {
      void dialog({ message: `导入失败：${err.message}`, confirmButtonText: '知道了' })
    })
  })
}

const handleRemove = async(id: string) => {
  if (appSetting['common.apiSource'] == id) {
    const backApi = apiSourceInfo.find(item => !item.disabled) ?? userApi.list[0]
    updateSetting({ 'common.apiSource': backApi?.id ?? '' })
  }
  userApi.list = await removeUserApi([id])
}
</script>

<style scoped>
.setting-panel {
  padding: 0 20px 24px;
}
</style>
