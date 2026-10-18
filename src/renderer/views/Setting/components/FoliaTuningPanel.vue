<template>
  <!-- Folia 当前视觉模式的调优面板：字段来自 tuningFields.ts，值存入 visualizerTunings -->
  <UiSettingSection v-if="fields.length" title="当前模式调优">
    <div class="flex flex-col gap-2 py-1">
      <div
        v-for="field in fields"
        :key="field.key"
        class="flex flex-wrap items-center justify-between gap-3"
      >
        <span class="text-[12.5px] text-t2">{{ field.label }}</span>

        <UiSwitch
          v-if="field.type === 'switch'"
          :model-value="tuning[field.key] === true"
          @update:model-value="updateTuning(field.key, $event)"
        />

        <div v-else-if="field.type === 'slider'" class="flex items-center gap-2">
          <input
            type="range"
            class="h-1 w-40 cursor-pointer appearance-none rounded-full bg-track accent-accent"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            :value="tuning[field.key] ?? field.min"
            @input="updateTuning(field.key, Number($event.target.value))"
          >
          <span class="w-12 text-right text-[11.5px] tabular-nums text-t3">{{ formatTuning(tuning[field.key] ?? field.min) }}</span>
        </div>

        <UiSelect
          v-else
          class="w-32"
          :list="field.options"
          :model-value="tuning[field.key]"
          @update:model-value="updateTuning(field.key, $event)"
        />
      </div>
    </div>
  </UiSettingSection>
</template>

<script setup lang="ts">
import { computed } from '@common/utils/vueTools'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { FOLIA_TUNING_FIELDS } from '@renderer/ui/features/folia/tuningFields'
import UiSelect from '@renderer/ui/primitives/UiSelect.vue'
import UiSettingSection from '@renderer/ui/primitives/UiSettingSection.vue'
import UiSwitch from '@renderer/ui/primitives/UiSwitch.vue'

const mode = computed(() => appSetting['playDetail.visualizerMode'])
const fields = computed(() => FOLIA_TUNING_FIELDS[mode.value] ?? [])
const tuning = computed(() => appSetting['playDetail.visualizerTunings']?.[mode.value] ?? {})

const updateTuning = (key: string, value: unknown) => {
  const current = appSetting['playDetail.visualizerMode']
  const tunings = { ...(appSetting['playDetail.visualizerTunings'] ?? {}) }
  tunings[current] = { ...(tunings[current] ?? {}), [key]: value }
  updateSetting({ 'playDetail.visualizerTunings': tunings })
}

const formatTuning = (value: unknown) => {
  if (typeof value !== 'number') return String(value ?? '')
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}
</script>
