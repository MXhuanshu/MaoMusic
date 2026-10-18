<template>
  <div class="flex items-center gap-0.5">
    <button
      v-if="playBtn"
      type="button"
      class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
      :aria-label="$t('list__play')"
      @contextmenu.capture.stop
      @click.stop="handleClick('play')"
    >
      <Play :size="14" :stroke-width="2" fill="currentColor" />
    </button>

    <button
      v-if="listAddBtn"
      type="button"
      class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
      :aria-label="$t('list__add_to')"
      @contextmenu.capture.stop
      @click.stop="handleClick('listAdd')"
    >
      <Plus :size="15" :stroke-width="2" />
    </button>

    <button
      v-if="downloadBtn && appSetting['download.enable']"
      type="button"
      class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
      :aria-label="$t('list__download')"
      @contextmenu.capture.stop
      @click.stop="handleClick('download')"
    >
      <Download :size="14" :stroke-width="2" />
    </button>

    <button
      v-if="startBtn"
      type="button"
      class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
      :aria-label="$t('list__start')"
      @contextmenu.capture.stop
      @click.stop="handleClick('start')"
    >
      <Play :size="14" :stroke-width="2" fill="currentColor" />
    </button>

    <button
      v-if="pauseBtn"
      type="button"
      class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
      :aria-label="$t('list__pause')"
      @contextmenu.capture.stop
      @click.stop="handleClick('pause')"
    >
      <Pause :size="14" :stroke-width="2" fill="currentColor" />
    </button>

    <button
      v-if="fileBtn"
      type="button"
      class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
      :aria-label="$t('list__file')"
      @contextmenu.capture.stop
      @click.stop="handleClick('file')"
    >
      <FolderOpen :size="14" :stroke-width="2" />
    </button>

    <button
      v-if="searchBtn"
      type="button"
      class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
      :aria-label="$t('list__search')"
      @contextmenu.capture.stop
      @click.stop="handleClick('search')"
    >
      <Search :size="14" :stroke-width="2" />
    </button>

    <button
      v-if="removeBtn"
      type="button"
      class="grid h-7 w-7 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-err/15 hover:text-err"
      :aria-label="$t('list__remove')"
      @click.stop="handleClick('remove')"
    >
      <Trash2 :size="14" :stroke-width="2" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Download, FolderOpen, Pause, Play, Plus, Search, Trash2 } from 'lucide-vue-next'
import { appSetting } from '@renderer/store/setting'

const props = withDefaults(defineProps<{
  index: number
  startBtn?: boolean
  pauseBtn?: boolean
  removeBtn?: boolean
  downloadBtn?: boolean
  playBtn?: boolean
  listAddBtn?: boolean
  searchBtn?: boolean
  fileBtn?: boolean
}>(), {
  startBtn: false,
  pauseBtn: false,
  removeBtn: false,
  downloadBtn: true,
  playBtn: true,
  listAddBtn: true,
  searchBtn: false,
  fileBtn: false,
})

const emit = defineEmits<{
  'btn-click': [payload: { action: string, index: number }]
}>()

const handleClick = (action: string) => {
  emit('btn-click', { action, index: props.index })
}
</script>
