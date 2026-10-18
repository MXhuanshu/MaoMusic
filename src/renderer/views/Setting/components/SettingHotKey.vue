<template lang="pug">
.setting-panel
  UiSettingSection(:title="$t('setting__hot_key_local_title')")
    .flex.flex-col.gap-1.py-1
      UiCheckbox(
        id="setting_download_hotKeyLocal"
        v-model="current_hot_key.local.enable"
        :label="$t('setting__is_enable')"
        @change="handleHotKeySaveConfig")
      .flex.flex-row.flex-wrap.gap-3.mt-2(
        :style="{ opacity: current_hot_key.local.enable ? 1 : .6 }")
        .flex.flex-col.gap-1(v-for="(item, index) in allHotKeys.local" :key="index" class="w-[30%] min-w-[160px]")
          h4(class="text-[12px] text-t3 truncate") {{ $t('setting__hot_key_' + item.name) }}
          input(
            class="h-8 w-full rounded-[8px] border border-line bg-fill px-2.5 text-[12.5px] text-fg outline-none focus:border-line2 focus:bg-fill2"
            readonly
            :placeholder="$t('setting__hot_key_unset_input')"
            :value="hotKeyConfig.local[item.name] && formatHotKeyName(hotKeyConfig.local[item.name].key)"
            @keyup.prevent
            @focus="handleHotKeyFocus($event, item, 'local')"
            @blur="handleHotKeyBlur($event, item, 'local')")

  UiSettingSection(:title="$t('setting__hot_key_global_title')")
    .flex.flex-col.gap-1.py-1
      UiCheckbox(
        id="setting_download_hotKeyGlobal"
        v-model="current_hot_key.global.enable"
        :label="$t('setting__is_enable')"
        @change="handleEnableHotKey")
      .flex.flex-row.flex-wrap.gap-3.mt-2(
        :style="{ opacity: current_hot_key.global.enable ? 1 : .6 }")
        .flex.flex-col.gap-1(v-for="(item, index) in allHotKeys.global" :key="index" class="w-[30%] min-w-[160px]")
          h4(class="text-[12px] text-t3 truncate") {{ $t('setting__hot_key_' + item.name) }}
          input(
            class="h-8 w-full rounded-[8px] border border-line bg-fill px-2.5 text-[12.5px] text-fg outline-none focus:border-line2 focus:bg-fill2"
            :class="hotKeyConfig.global[item.name] && hotKeyStatus[hotKeyConfig.global[item.name].key] && hotKeyStatus[hotKeyConfig.global[item.name].key].status === false ? 'line-through' : ''"
            :value="hotKeyConfig.global[item.name] && formatHotKeyName(hotKeyConfig.global[item.name].key)"
            readonly
            :placeholder="$t('setting__hot_key_unset_input')"
            @input.prevent
            @focus="handleHotKeyFocus($event, item, 'global')"
            @blur="handleHotKeyBlur($event, item, 'global')")
</template>

<script>
import { ref, onBeforeUnmount, toRaw, shallowReactive } from '@common/utils/vueTools'
import { allHotKeys, hotKeySetEnable, hotKeySetConfig, hotKeyGetStatus } from '@renderer/utils/ipc'
import { isMac } from '@common/utils'
import { useI18n } from '@renderer/plugins/i18n'

import UiCheckbox from '@renderer/ui/primitives/UiCheckbox.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'

const formatHotKeyName = (name) => {
  if (name.includes('arrow')) {
    name = name.replace(/arrow(left|right|up|down)/, s => {
      switch (s) {
        case 'arrowleft': return '←'
        case 'arrowright': return '→'
        case 'arrowup': return '↑'
        case 'arrowdown': return '↓'
      }
    })
  }
  if (name.includes('mod')) name = name.replace('mod', isMac ? 'Command' : 'Ctrl')
  name = name.replace(/(\+|^)[a-z]/g, l => l.toUpperCase())
  if (name.length > 1) name = name.replace(/\+/g, ' + ')
  return name
}

export default {
  name: 'SettingHotKey',
  components: { UiCheckbox, UiSettingSection },
  setup() {
    const t = useI18n()
    const current_hot_key = ref({
      local: {
        enable: false,
        keys: {},
      },
      global: {
        enable: false,
        keys: {},
      },
    })

    const hotKeyConfig = ref({
      local: {},
      global: {},
    })

    const hotKeyStatus = ref({})
    let isEditHotKey = false
    let hotKeyTargetInput
    let newHotKey
    let tip

    const initHotKeyConfig = () => {
      let config = {}
      for (const [type, typeInfo] of Object.entries(current_hot_key.value)) {
        let configInfo = config[type] = {}
        for (const [key, info] of Object.entries(typeInfo.keys)) {
          if (!info.name) continue
          configInfo[info.name] = shallowReactive({
            key,
            info,
          })
        }
      }
      hotKeyConfig.value = config
    }

    const handleHotKeyFocus = (event, info, type) => {
      setTimeout(async() => {
        await hotKeySetEnable(false)
        window.lx.isEditingHotKey = true
        isEditHotKey = true
        let config = hotKeyConfig.value[type][info.name]
        newHotKey = config?.key
        hotKeyTargetInput = event.target
        event.target.value = tip = t('setting__hot_key_tip_input')
      })
    }

    const handleHotKeyBlur = (event, info, type) => {
      setTimeout(async() => {
        await hotKeySetEnable(true)
        window.lx.isEditingHotKey = false
        isEditHotKey = false
        const prevInput = hotKeyTargetInput
        hotKeyTargetInput = null
        if (prevInput?.value == tip) {
          prevInput.value = newHotKey ? formatHotKeyName(newHotKey) : ''
          return
        }
        let config = hotKeyConfig.value[type][info.name]
        let originKey
        if (type == 'global' && newHotKey && current_hot_key.value.global.enable) {
          try {
            await hotKeySetConfig({
              action: 'register',
              data: {
                key: newHotKey,
                info,
              },
            })
          } catch (error) {
            console.log(error)
            return
          }
        }
        if (config) {
          if (config.key == newHotKey) return
          originKey = config.key
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete current_hot_key.value[type].keys[config.key]
        } else if (!newHotKey) return

        if (newHotKey) {
          for (const [tempType, tempInfo] of Object.entries(current_hot_key.value)) {
            if (tempType == type) continue
            config = tempInfo.keys[newHotKey]
            if (config) {
              console.log(newHotKey, info, config, info.name, config.name)
              // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
              delete current_hot_key.value[tempType].keys[newHotKey]
              break
            }
          }
          current_hot_key.value[type].keys[newHotKey] = info
        }

        initHotKeyConfig()
        if (originKey && current_hot_key.value.global.enable) {
          try {
            await hotKeySetConfig({
              action: 'unregister',
              data: originKey,
            })
          } catch (error) {
            console.log(error)
          }
        }
        await handleHotKeySaveConfig()
        await getHotKeyStatus()
      })
    }

    const handleKeyDown = ({ event, keys, key, type }) => {
      if (!event || event.repeat || type == 'up' || !isEditHotKey) return
      event.preventDefault()
      switch (key) {
        case 'delete':
        case 'backspace':
          key = ''
          break
      }
      hotKeyTargetInput.value = formatHotKeyName(key)
      newHotKey = key
    }

    const handleHotKeySaveConfig = async() => {
      await hotKeySetConfig({
        action: 'config',
        data: toRaw(current_hot_key.value),
      })
    }
    const handleEnableHotKey = async() => {
      await hotKeySetConfig({
        action: 'enable',
        data: current_hot_key.value.global.enable,
      })
      await handleHotKeySaveConfig()
      await getHotKeyStatus()
    }
    const getHotKeyStatus = async() => {
      return hotKeyGetStatus().then(status => {
        hotKeyStatus.value = status
        return status
      })
    }

    current_hot_key.value = window.lx.appHotKeyConfig
    initHotKeyConfig()
    void getHotKeyStatus()

    window.app_event.on('keyDown', handleKeyDown)

    onBeforeUnmount(() => {
      window.app_event.off('keyDown', handleKeyDown)
    })

    return {
      allHotKeys,
      current_hot_key,
      hotKeyConfig,
      hotKeyStatus,
      handleHotKeyFocus,
      handleHotKeyBlur,
      handleEnableHotKey,
      formatHotKeyName,
      handleHotKeySaveConfig,
    }
  },
}
</script>
