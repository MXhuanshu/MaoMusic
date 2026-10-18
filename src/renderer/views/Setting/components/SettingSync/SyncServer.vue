<template>
  <!-- Folia 服务端模式：连接码/地址/设备信息 + 端口输入 + 操作按钮 -->
  <div class="setting-panel">
    <UiSettingSection :title="syncEnableServerTitle">
      <div class="flex flex-col gap-1.5 py-1 text-[12.5px] leading-relaxed">
        <div class="flex flex-wrap items-baseline gap-x-2">
          <span class="text-t3">{{ $t('setting__sync_server_auth_code', { code: '' }) }}</span>
          <span class="font-mono text-[15px] tracking-wider text-accent">{{ sync.server.status.code || '——' }}</span>
        </div>
        <div class="flex flex-wrap items-baseline gap-x-2">
          <span class="text-t3">{{ $t('setting__sync_server_address', { address: '' }) }}</span>
          <span class="min-w-0 break-all text-t2">{{ sync.server.status.address.join(', ') || '—' }}</span>
        </div>
        <div class="flex flex-wrap items-baseline gap-x-2">
          <span class="text-t3">{{ $t('setting__sync_server_device', { devices: '' }) }}</span>
          <span class="min-w-0 break-all text-t2">{{ syncDevices || '—' }}</span>
        </div>
      </div>

      <div class="mt-3">
        <div class="mb-1.5 text-[11.5px] text-t3">{{ $t('setting__sync_server_port') }}</div>
        <UiTextField
          :model-value="appSetting['sync.server.port']"
          :disabled="sync.enable"
          type="number"
          :placeholder="$t('setting__sync_server_port_tip')"
          @update:model-value="setSyncServerPort"
        />
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <UiButton size="sm" variant="secondary" :disabled="!sync.server.status.status" @click="refreshSyncCode">
          <RefreshCw :size="13" :stroke-width="2" />
          <span>{{ $t('setting__sync_server_refresh_code') }}</span>
        </UiButton>
        <UiButton size="sm" variant="ghost" @click="isShowDeviceListModal = true">
          <ListChecks :size="13" :stroke-width="2" />
          <span>{{ $t('setting__sync_server_show_device_list') }}</span>
        </UiButton>
      </div>
    </UiSettingSection>

    <ServerDeviceListModal v-model="isShowDeviceListModal" />
  </div>
</template>

<script>
import { computed, ref } from '@common/utils/vueTools'
import { ListChecks, RefreshCw } from 'lucide-vue-next'
import { sync } from '@renderer/store'
import { sendSyncAction } from '@renderer/utils/ipc'
import { useI18n } from '@renderer/plugins/i18n'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { debounce } from '@common/utils/common'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'
import UiTextField from '@renderer/ui/primitives/UiTextField.vue'
import UiButton from '@renderer/ui/primitives/UiButton.vue'
import ServerDeviceListModal from './ServerDeviceListModal.vue'

export default {
  name: 'SettingSyncServer',
  components: {
    ListChecks,
    RefreshCw,
    UiSettingSection,
    UiTextField,
    UiButton,
    ServerDeviceListModal,
  },
  setup() {
    const t = useI18n()
    const isShowDeviceListModal = ref(false)

    const syncEnableServerTitle = computed(() => {
      let title = t('setting__sync_server_mode')
      if (sync.server.status.message) {
        title += ` [${sync.server.status.message}]`
      }
      return title
    })

    const syncDevices = computed(() => {
      return sync.server.status.devices.length
        ? sync.server.status.devices.map(d => `${d.deviceName} (${d.clientId.substring(0, 5)})`).join(', ')
        : ''
    })

    const refreshSyncCode = () => {
      void sendSyncAction({ action: 'generate_code' })
    }

    const setSyncServerPort = debounce(port => {
      updateSetting({ 'sync.server.port': port.trim() })
    }, 500)

    return {
      appSetting,
      sync,
      syncEnableServerTitle,
      setSyncServerPort,
      syncDevices,
      refreshSyncCode,
      isShowDeviceListModal,
    }
  },
}
</script>
