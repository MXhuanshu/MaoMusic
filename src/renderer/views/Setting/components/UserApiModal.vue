<template>
  <material-modal :show="modelValue" bg-close teleport="#view" @close="handleClose">
    <main class="flex max-h-[76vh] w-[min(560px,86vw)] flex-col p-5">
      <header class="flex shrink-0 items-center justify-between">
        <div>
          <h2 class="text-[16px] font-semibold text-fg">自定义音乐源</h2>
          <p class="mt-1 text-[11.5px] text-t3">导入 LX Music 兼容的音源脚本，导入后在「音源」里启用。</p>
        </div>
        <UiButton size="sm" variant="secondary" @click="handleClose">关闭</UiButton>
      </header>

      <div class="ui-scroll mt-4 min-h-[160px] flex-1 overflow-y-auto pr-1">
        <ul v-if="apiList.length" class="flex flex-col gap-2">
          <li
            v-for="(api, index) in apiList"
            :key="api.id"
            class="rounded-[12px] border p-3 transition-colors"
            :class="appSetting['common.apiSource'] == api.id ? 'border-accent/50 bg-accent/8' : 'border-line bg-fill/40'"
          >
            <div class="flex items-start gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="truncate text-[13.5px] font-medium text-fg">{{ api.name }}</span>
                  <span v-if="api.version" class="rounded bg-fill2 px-1.5 py-0.5 text-[10.5px] text-t3">
                    {{ /^\d/.test(api.version) ? `v${api.version}` : api.version }}
                  </span>
                  <span v-if="appSetting['common.apiSource'] == api.id" class="rounded bg-accent/15 px-1.5 py-0.5 text-[10.5px] text-accent">使用中</span>
                </div>
                <p v-if="api.author" class="mt-1 text-[11px] text-t3">{{ api.author }}</p>
                <p class="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-t2">{{ api.description }}</p>
                <div class="mt-2">
                  <UiCheckbox
                    :id="`user_api_${api.id}`"
                    :model-value="api.allowShowUpdateAlert"
                    :label="$t('user_api__allow_show_update_alert')"
                    @update:model-value="handleChangeAllowUpdateAlert(api, $event)"
                  />
                </div>
              </div>
              <UiButton size="sm" variant="ghost" @click.stop="handleRemove(index)">移除</UiButton>
            </div>
          </li>
        </ul>
        <div v-else class="grid h-[160px] place-items-center rounded-[12px] border border-dashed border-line text-[12px] text-t3">
          {{ $t('user_api__noitem') }}
        </div>
      </div>

      <p class="mt-3 text-[11px] leading-relaxed text-t3">
        音源脚本仅在本机运行，请只导入可信来源。导入后可在「基础 → 音源」里切换。
      </p>

      <footer class="mt-4 flex shrink-0 flex-wrap items-center gap-2">
        <UiButton size="sm" variant="secondary" @click="isShowOnlineImportModal = true">
          {{ $t('user_api__btn_import_online') }}
        </UiButton>
        <UiButton size="sm" variant="primary" @click="handleImport">
          <Upload :size="13" :stroke-width="2" />
          从文件导入
        </UiButton>
        <span class="ml-auto text-[11px] text-t3">支持 .js 音源脚本</span>
      </footer>

      <UserApiOnlineImportModal v-model:show="isShowOnlineImportModal" @import="importUserApi" />
    </main>
  </material-modal>
</template>

<script setup lang="ts">
import { computed, ref } from '@common/utils/vueTools'
import { Upload } from 'lucide-vue-next'
import { importUserApi as importUserApiIpc, removeUserApi, setAllowShowUserApiUpdateAlert, showSelectDialog } from '@renderer/utils/ipc'
import { readFile } from '@common/utils/nodejs'
import apiSourceInfo from '@renderer/utils/musicSdk/api-source-info'
import { userApi } from '@renderer/store'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { dialog } from '@renderer/plugins/Dialog'
import UiButton from '@renderer/ui/primitives/UiButton.vue'
import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UserApiOnlineImportModal from './UserApiOnlineImportModal.vue'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isShowOnlineImportModal = ref(false)
const apiList = computed(() => userApi.list)

const importUserApi = async(script: string) => {
  try {
    const { apiList } = await importUserApiIpc(script)
    userApi.list = apiList
  } catch (err: any) {
    void dialog({
      message: window.i18n.t('user_api_import__failed', { message: err.message }),
      confirmButtonText: window.i18n.t('ok'),
    })
  }
}

const handleImport = () => {
  if (userApi.list.length > 20) {
    void dialog({
      message: window.i18n.t('user_api__max_tip'),
      confirmButtonText: window.i18n.t('ok'),
    })
    return
  }
  void showSelectDialog({
    title: window.i18n.t('user_api__import_file'),
    properties: ['openFile'],
    filters: [
      { name: 'LX API File', extensions: ['js'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  }).then(async result => {
    if (result.canceled) return
    const data = await readFile(result.filePaths[0])
    await importUserApi(data.toString())
  })
}

const handleRemove = async(index: number) => {
  const api = apiList.value[index]
  if (!api) return
  if (appSetting['common.apiSource'] == api.id) {
    let backApi: any = apiSourceInfo.find(item => !item.disabled)
    if (!backApi) backApi = userApi.list[0]
    updateSetting({ 'common.apiSource': backApi?.id ?? '' })
  }
  userApi.list = await removeUserApi([api.id])
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleChangeAllowUpdateAlert = (api: any, enable: boolean) => {
  void setAllowShowUserApiUpdateAlert(api.id, enable)
}
</script>
