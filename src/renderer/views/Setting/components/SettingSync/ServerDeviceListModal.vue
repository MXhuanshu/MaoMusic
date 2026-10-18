<template>
  <!-- Folia 玻璃弹窗：已认证设备列表，保留原有刷新与移除逻辑 -->
  <teleport to="#root">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-6"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="flex max-h-[70vh] w-[460px] max-w-full flex-col overflow-hidden rounded-[16px] border border-line bg-menu shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <header class="flex h-12 shrink-0 items-center gap-3 border-b border-line px-4">
          <h2 class="min-w-0 flex-1 truncate text-[13px] font-medium text-fg">
            {{ $t('setting__sync_server_device_list_title') }}
          </h2>
          <button
            type="button"
            class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-t3 transition-colors duration-150 hover:bg-fill hover:text-fg"
            :aria-label="$t('close')"
            @click="$emit('update:modelValue', false)"
          >
            <X :size="15" :stroke-width="2" />
          </button>
        </header>

        <div class="ui-scroll min-h-[120px] flex-1 overflow-y-auto p-2">
          <ul v-if="historyDeviceList.length" class="flex flex-col">
            <li
              v-for="(device, index) in historyDeviceList"
              :key="device.id"
              class="group flex items-center gap-3 rounded-[10px] px-2.5 py-2 transition-colors duration-150 hover:bg-fill"
            >
              <div class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-fill2 text-t2">
                <Smartphone v-if="device.isMobile" :size="15" :stroke-width="1.8" />
                <Monitor v-else :size="15" :stroke-width="1.8" />
              </div>

              <div class="min-w-0 flex-1">
                <div class="truncate text-[13px] leading-snug text-fg">{{ device.name }}</div>
                <div class="mt-0.5 truncate text-[11.5px] leading-snug text-t3">
                  {{ $t('setting__sync_server_device_list_time', { time: device.lastConnectDate }) }}
                </div>
              </div>

              <button
                type="button"
                class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-t3 opacity-0 transition-colors duration-150 hover:bg-err/15 hover:text-err group-hover:opacity-100"
                :aria-label="$t('setting__sync_server_device_list_btn_remove')"
                @click.stop="handleRemove(index)"
              >
                <Trash2 :size="14" :stroke-width="2" />
              </button>
            </li>
          </ul>

          <UiEmptyState
            v-else
            class="h-[160px]"
            :title="$t('setting__sync_server_device_list_noitem')"
          />
        </div>

        <footer class="shrink-0 border-t border-line px-4 py-2.5 text-[11.5px] leading-relaxed text-t3">
          {{ $t('setting__sync_server_device_list_tips') }}
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script>
import { watch, ref } from '@common/utils/vueTools'
import { Monitor, Smartphone, Trash2, X } from 'lucide-vue-next'
import { sync } from '@renderer/store'
import { getSyncServerDevices, removeSyncServerDevice } from '@renderer/utils/ipc'
import { dateFormat } from '@common/utils/common'
import UiEmptyState from '@renderer/ui/primitives/UiEmptyState.vue'

export default {
  name: 'ServerDeviceListModal',
  components: {
    Monitor,
    Smartphone,
    Trash2,
    X,
    UiEmptyState,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props) {
    const historyDeviceList = ref([])

    const getList = () => {
      void getSyncServerDevices().then((list) => {
        historyDeviceList.value = list.map(d => {
          return {
            id: d.clientId,
            name: d.deviceName,
            lastConnectDate: d.lastConnectDate ? dateFormat(d.lastConnectDate) : '-',
            isMobile: d.isMobile,
          }
        })
      })
    }

    watch(() => sync.server.status.devices.length, () => {
      if (!props.modelValue) return
      getList()
    })
    watch(() => props.modelValue, (val) => {
      if (!val) return
      getList()
    })

    const handleRemove = (index) => {
      void removeSyncServerDevice(historyDeviceList.value[index].id).then(getList)
    }

    return {
      historyDeviceList,
      handleRemove,
    }
  },
}
</script>
