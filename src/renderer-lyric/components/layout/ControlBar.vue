<template>
  <!--
    桌面歌词的胶囊控制条：hover 时淡入，锁定后整条隐藏。
    按钮统一 28px 圆形，图标换成 lucide，配色直接读主窗推过来的令牌。
  -->
  <div class="flex px-1 pt-1">
    <div
      class="flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded-full border border-line bg-glass px-1.5 py-1 backdrop-blur-xl"
      @mousedown="handleLyricMouseDown"
      @touchstart="handleLyricTouchStart"
    >
      <button
        type="button"
        class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
        :title="$t('desktop_lyric__close')"
        @click="handleClose"
      >
        <X :size="14" :stroke-width="2" />
      </button>

      <button
        type="button"
        class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
        :title="$t('desktop_lyric__' + (setting['desktopLyric.isLock'] ? 'unlock' : 'lock'))"
        @click="handleLock"
      >
        <Unlock v-if="setting['desktopLyric.isLock']" :size="14" :stroke-width="2" />
        <Lock v-else :size="14" :stroke-width="2" />
      </button>

      <span class="mx-0.5 h-4 w-px shrink-0 bg-line" />

      <button
        type="button"
        class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
        :title="$t('desktop_lyric__font_increase')"
        @click="handleFontChange('increase', 1)"
      >
        <Plus :size="14" :stroke-width="2.2" />
      </button>
      <button
        type="button"
        class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
        :title="$t('desktop_lyric__font_decrease')"
        @click="handleFontChange('decrease', 1)"
      >
        <Minus :size="14" :stroke-width="2.2" />
      </button>

      <button
        type="button"
        class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
        :title="$t('desktop_lyric__opacity_increase')"
        @click="handleOpactiyChange('increase', 10)"
        @contextmenu="handleOpactiyChange('increase', 2)"
      >
        <Sun :size="14" :stroke-width="2" />
      </button>
      <button
        type="button"
        class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
        :title="$t('desktop_lyric__opacity_decrease')"
        @click="handleOpactiyChange('decrease', 10)"
        @contextmenu="handleOpactiyChange('decrease', 2)"
      >
        <Moon :size="14" :stroke-width="2" />
      </button>

      <span class="mx-0.5 h-4 w-px shrink-0 bg-line" />

      <button
        type="button"
        class="grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors duration-150 hover:bg-fill"
        :class="setting['desktopLyric.style.isZoomActiveLrc'] ? 'text-accent' : 'text-t2 hover:text-fg'"
        :title="$t('desktop_lyric__' + (setting['desktopLyric.style.isZoomActiveLrc'] ? 'lrc_active_zoom_off' : 'lrc_active_zoom_on'))"
        @click="handleZoomLrc"
      >
        <Maximize2 v-if="setting['desktopLyric.style.isZoomActiveLrc']" :size="14" :stroke-width="2" />
        <Minimize2 v-else :size="14" :stroke-width="2" />
      </button>

      <button
        type="button"
        class="grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors duration-150 hover:bg-fill"
        :class="setting['desktopLyric.isAlwaysOnTop'] ? 'text-accent' : 'text-t2 hover:text-fg'"
        :title="$t('desktop_lyric__' + (setting['desktopLyric.isAlwaysOnTop'] ? 'win_top_off' : 'win_top_on'))"
        @click="handleAlwaysOnTop"
      >
        <PinOff v-if="setting['desktopLyric.isAlwaysOnTop']" :size="14" :stroke-width="2" />
        <Pin v-else :size="14" :stroke-width="2" />
      </button>
    </div>
  </div>
</template>

<script>
import { Lock, Maximize2, Minimize2, Minus, Moon, Pin, PinOff, Plus, Sun, Unlock, X } from 'lucide-vue-next'
import { setting } from '@lyric/store/state'
import { updateSetting } from '@lyric/store/action'
import useDrag from './useDrag'

export default {
  components: {
    Lock,
    Maximize2,
    Minimize2,
    Minus,
    Moon,
    Pin,
    PinOff,
    Plus,
    Sun,
    Unlock,
    X,
  },
  setup() {
    const { handleLyricMouseDown, handleLyricTouchStart } = useDrag()

    const handleClose = () => {
      updateSetting({ 'desktopLyric.enable': false })
    }
    const handleLock = () => {
      updateSetting({ 'desktopLyric.isLock': true })
    }
    const handleAlwaysOnTop = () => {
      updateSetting({ 'desktopLyric.isAlwaysOnTop': !setting['desktopLyric.isAlwaysOnTop'] })
    }
    const handleZoomLrc = () => {
      updateSetting({ 'desktopLyric.style.isZoomActiveLrc': !setting['desktopLyric.style.isZoomActiveLrc'] })
    }
    const handleFontChange = (action, step) => {
      let num
      switch (action) {
        case 'increase':
          num = Math.min(setting['desktopLyric.style.fontSize'] + step, 80)
          break
        case 'decrease':
          num = Math.max(setting['desktopLyric.style.fontSize'] - step, 10)
          break
      }
      if (setting['desktopLyric.style.fontSize'] == num) return
      updateSetting({ 'desktopLyric.style.fontSize': num })
    }
    const handleOpactiyChange = (action, step) => {
      let num
      switch (action) {
        case 'increase':
          num = Math.min(setting['desktopLyric.style.opacity'] + step, 100)
          break
        case 'decrease':
          num = Math.max(setting['desktopLyric.style.opacity'] - step, 6)
          break
      }
      if (setting['desktopLyric.style.opacity'] == num) return
      updateSetting({ 'desktopLyric.style.opacity': num })
    }
    return {
      setting,
      handleClose,
      handleLock,
      handleAlwaysOnTop,
      handleZoomLrc,
      handleFontChange,
      handleOpactiyChange,
      handleLyricMouseDown,
      handleLyricTouchStart,
    }
  },
}
</script>
