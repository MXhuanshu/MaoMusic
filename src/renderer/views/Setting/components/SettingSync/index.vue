<template>
  <!-- Folia 同步设置：启用开关 + 服务端/客户端二选一，其余交给子面板 -->
  <div class="setting-panel">
    <UiSettingSection :title="$t('setting__sync')">
      <UiSwitch
        :model-value="appSetting['sync.enable']"
        :label="$t('setting__sync_enable')"
        @update:model-value="updateSetting({ 'sync.enable': $event })"
      />

      <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 py-1">
        <span class="text-[12.5px] text-t3">{{ $t('setting__sync_mode') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <UiCheckbox
            id="setting_sync_mode_server"
            name="setting_sync_mode"
            need
            :disabled="sync.enable"
            :model-value="appSetting['sync.mode']"
            value="server"
            :label="$t('setting__sync_mode_server')"
            @update:model-value="updateSetting({ 'sync.mode': $event })"
          />
          <UiCheckbox
            id="setting_sync_mode_client"
            name="setting_sync_mode"
            need
            :disabled="sync.enable"
            :model-value="appSetting['sync.mode']"
            value="client"
            :label="$t('setting__sync_mode_client')"
            @update:model-value="updateSetting({ 'sync.mode': $event })"
          />
        </div>

        <button
          type="button"
          class="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full text-t3 transition-colors duration-150 hover:bg-fill hover:text-fg"
          :aria-label="$t('setting__sync_tip')"
          :title="$t('setting__sync_tip')"
          @click="openUrl('https://lyswhut.github.io/lx-music-doc/desktop/faq/sync')"
        >
          <HelpCircle :size="14" :stroke-width="2" />
        </button>
      </div>
    </UiSettingSection>

    <SyncClient v-if="sync.mode == 'client'" />
    <SyncServer v-else />
  </div>
</template>

<script>
import { HelpCircle } from 'lucide-vue-next'
import { sync } from '@renderer/store'
import { openUrl } from '@common/utils/electron'
import { appSetting, updateSetting } from '@renderer/store/setting'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'
import UiSwitch from '@renderer/ui/primitives/UiSwitch.vue'
import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import SyncServer from './SyncServer.vue'
import SyncClient from './SyncClient.vue'

export default {
  name: 'SettingSync',
  components: {
    HelpCircle,
    UiSettingSection,
    UiSwitch,
    UiCheckbox,
    SyncServer,
    SyncClient,
  },
  setup() {
    return {
      appSetting,
      updateSetting,
      sync,
      openUrl,
    }
  },
}
</script>
