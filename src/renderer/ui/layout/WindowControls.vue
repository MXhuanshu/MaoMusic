<template>
  <!--
    Folia 的窗口控制：32px 高，三个圆形按钮，悬停才完全显形。
    猫仙主窗口是 frame:false + transparent，所以这三个按钮是唯一关窗入口。
  -->
  <div class="app-no-drag flex h-full items-center">
    <button
      type="button"
      class="group flex h-full w-11 items-center justify-center text-t3 transition-colors duration-150 hover:bg-fill hover:text-fg"
      :title="$t('min')"
      :aria-label="$t('min')"
      @click="minWindow"
    >
      <Minus :size="15" :stroke-width="2" />
    </button>

    <button
      type="button"
      class="group flex h-full w-11 items-center justify-center text-t3 transition-colors duration-150 hover:bg-fill hover:text-fg"
      :title="isFullscreen ? '退出全屏' : '全屏'"
      :aria-label="isFullscreen ? '退出全屏' : '全屏'"
      @click="toggleFullscreen"
    >
      <Minimize2 v-if="isFullscreen" :size="14" :stroke-width="2" />
      <Maximize2 v-else :size="14" :stroke-width="2" />
    </button>

    <button
      type="button"
      class="flex h-full w-12 items-center justify-center text-t3 transition-colors duration-150 hover:bg-err hover:text-white"
      :title="$t('close')"
      :aria-label="$t('close')"
      @click="closeWindow"
    >
      <X :size="16" :stroke-width="2" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Maximize2, Minimize2, Minus, X } from 'lucide-vue-next'
import { isFullscreen } from '@renderer/store'
import { closeWindow, minWindow, setFullScreen } from '@renderer/utils/ipc'

const toggleFullscreen = () => {
  void setFullScreen(!isFullscreen.value)
}
</script>
