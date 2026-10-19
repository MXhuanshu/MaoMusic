<template>
  <!--
    Folia 歌词视觉模式切换器：直接在播放详情舞台上切换 14 种模式，
    不用去设置里翻。按当前模式动态列出全部注册模式。
  -->
  <div class="pointer-events-auto flex flex-col items-end gap-2">
    <button
      type="button"
      class="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/35 text-white/70 backdrop-blur-md transition-colors duration-150 hover:bg-black/55 hover:text-white"
      :aria-label="'切换歌词视觉模式'"
      :title="'切换歌词视觉模式'"
      @click="visible = !visible"
    >
      <Sparkles :size="16" :stroke-width="2" />
    </button>

    <transition
      enter-active-class="transition-[opacity,transform] duration-200 ease-ui"
      enter-from-class="translate-y-1 opacity-0"
      leave-active-class="transition-[opacity,transform] duration-150 ease-ui"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="visible"
        class="max-h-[52vh] w-56 overflow-y-auto rounded-[14px] border border-white/10 bg-black/55 p-1.5 backdrop-blur-xl ui-scroll"
      >
        <button
          v-for="item in modes"
          :key="item.id"
          type="button"
          class="flex w-full items-center gap-2 rounded-[9px] px-2.5 py-1.5 text-left text-[12.5px] transition-colors duration-100"
          :class="item.id === current ? 'bg-white/15 text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'"
          @click="handleSelect(item.id)"
        >
          <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
          <Check v-if="item.id === current" :size="13" :stroke-width="2.4" />
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from '@common/utils/vueTools'
import { Check, Sparkles } from 'lucide-vue-next'
import { appSetting, updateSetting } from '@renderer/store/setting'

const visible = ref(false)

const MODES = [
  { id: 'classic', label: '流光 · Classic' },
  { id: 'cadenza', label: '华彩 · Cadenza' },
  { id: 'cappella', label: '阿卡贝拉 · Cappella' },
  { id: 'claddagh', label: '克拉达 · Claddagh' },
  { id: 'diorama', label: '立体景 · Diorama' },
  { id: 'fume', label: '烟雾 · Fume' },
  { id: 'lumiere', label: '光晕 · Lumiere' },
  { id: 'monet', label: '莫奈 · Monet' },
  { id: 'partita', label: '帕蒂塔 · Partita' },
  { id: 'pendolo', label: '摆钟 · Pendolo' },
  { id: 'sonnet', label: '十四行诗 · Sonnet' },
  { id: 'still', label: '静物 · Still' },
  { id: 'tempera', label: '蛋彩 · Tempera' },
  { id: 'tilt', label: '倾斜 · Tilt' },
]

const modes = computed(() => MODES)
const current = computed(() => appSetting['playDetail.visualizerMode'])

const handleSelect = (id: string) => {
  updateSetting({ 'playDetail.visualizerMode': id })
  visible.value = false
}
</script>
