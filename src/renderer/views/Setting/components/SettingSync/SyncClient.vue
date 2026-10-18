<template>
  <!-- Folia 客户端模式：状态/地址信息行 + 服务地址输入 -->
  <UiSettingSection :title="$t('setting__sync_client_mode')">
    <div class="flex flex-col gap-1.5 py-1 text-[12.5px] leading-relaxed">
      <div class="flex flex-wrap items-baseline gap-x-2">
        <span class="text-t3">{{ $t('setting__sync_client_status', { status: '' }) }}</span>
        <span :class="sync.client.status.status ? 'text-ok' : 'text-t2'">{{ clientStatus }}</span>
      </div>
      <div class="flex flex-wrap items-baseline gap-x-2">
        <span class="text-t3">{{ $t('setting__sync_client_address', { address: '' }) }}</span>
        <span class="min-w-0 break-all text-t2">{{ sync.client.status.address.join(', ') || '—' }}</span>
      </div>
    </div>

    <div class="mt-3">
      <div class="mb-1.5 text-[11.5px] text-t3">{{ $t('setting__sync_client_host') }}</div>
      <UiTextField
        :model-value="appSetting['sync.client.host']"
        :disabled="sync.enable"
        :placeholder="$t('setting__sync_client_host_tip')"
        @update:model-value="setSyncClientHost"
      />
    </div>
  </UiSettingSection>
</template>

<script>
import { computed } from '@common/utils/vueTools'
import { sync } from '@renderer/store'
import { useI18n } from '@renderer/plugins/i18n'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { debounce } from '@common/utils/common'
import { SYNC_CODE } from '@common/constants_sync'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'
import UiTextField from '@renderer/ui/primitives/UiTextField.vue'

export default {
  name: 'SettingSyncClient',
  components: { UiSettingSection, UiTextField },
  setup() {
    const t = useI18n()

    const clientStatus = computed(() => {
      let status
      switch (sync.client.status.message) {
        case SYNC_CODE.msgBlockedIp:
          status = t('setting__sync_code_blocked_ip')
          break
        case SYNC_CODE.authFailed:
          status = t('setting__sync_code_fail')
          break
        default:
          status = sync.client.status.message
            ? sync.client.status.message
            : sync.client.status.status
              ? t('setting_sync_status_enabled')
              : t('sync_status_disabled')
          break
      }
      return status
    })

    const setSyncClientHost = debounce(host => {
      updateSetting({ 'sync.client.host': host.trim() })
    }, 500)


    return {
      appSetting,
      sync,
      setSyncClientHost,
      clientStatus,
    }
  },
}
</script>
