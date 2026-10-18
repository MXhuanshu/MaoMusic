<template>
  <teleport to="#root">
    <div
      ref="dom_menu"
      class="absolute z-10 overflow-hidden rounded-[12px] bg-menu text-[12px] text-fg shadow-[0_2px_14px_rgba(0,0,0,.35)] ring-1 ring-line"
      :style="menuStyles"
      :aria-hidden="!modelValue"
    >
      <div class="flex flex-col">
        <div class="flex flex-row flex-nowrap">
          <div class="min-w-[120px] flex-auto whitespace-nowrap px-2.5 py-2.5 text-t3">{{ $t('lyric_menu__lrc_size', { size: appSetting['playDetail.style.fontSize'] }) }}</div>
          <button class="flex h-[34px] min-w-[40px] flex-none cursor-pointer items-center justify-center truncate px-2.5 opacity-70 transition-colors hover:bg-fill disabled:opacity-30" :disabled="appSetting['playDetail.style.fontSize'] == 100" ignore-tip :aria-label="$t('lyric_menu__size_reset')" @click="fontSizeReset">{{ $t('lyric_menu__size_reset') }}</button>
        </div>
        <div class="flex flex-row flex-nowrap">
          <button class="flex h-[34px] min-w-[60px] flex-auto cursor-pointer items-center justify-center truncate px-2.5 transition-colors hover:bg-fill active:bg-raise" :aria-label="$t('lyric_menu__size_add')" @click="fontSizeUp(5)" @contextmenu="fontSizeUp(1)">
            <svg version="1.1" height="18px" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" space="preserve">
              <use xlink:href="#icon-font-increase" />
            </svg>
          </button>
          <button class="flex h-[34px] min-w-[60px] flex-auto cursor-pointer items-center justify-center truncate px-2.5 transition-colors hover:bg-fill active:bg-raise" :aria-label="$t('lyric_menu__size_dec')" @click="fontSizeDown(5)" @contextmenu="fontSizeDown(1)">
            <svg version="1.1" height="18px" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" space="preserve">
              <use xlink:href="#icon-font-decrease" />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex flex-col border-t border-line">
        <div class="flex flex-row flex-nowrap">
          <div class="min-w-[120px] flex-auto whitespace-nowrap px-2.5 py-2.5 text-t3">{{ $t('lyric_menu__offset', { offset }) }}</div>
          <button class="flex h-[34px] min-w-[40px] flex-none cursor-pointer items-center justify-center truncate px-2.5 opacity-70 transition-colors hover:bg-fill disabled:opacity-30" :disabled="offsetDisabled || offset == originOffset" @click="offsetReset">{{ $t('lyric_menu__offset_reset') }}</button>
        </div>
        <div class="flex flex-row flex-nowrap">
          <button class="flex h-[34px] min-w-[60px] flex-auto cursor-pointer items-center justify-center truncate px-2.5 transition-colors hover:bg-fill active:bg-raise disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent" :disabled="offsetDisabled" ignore-tip :aria-label="$t('lyric_menu__offset_add_10')" @click="setOffset(10)">+ 10ms</button>
          <button class="flex h-[34px] min-w-[60px] flex-auto cursor-pointer items-center justify-center truncate px-2.5 transition-colors hover:bg-fill active:bg-raise disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent" :disabled="offsetDisabled" ignore-tip :aria-label="$t('lyric_menu__offset_dec_10')" @click="setOffset(-10)">- 10ms</button>
        </div>
        <div class="flex flex-row flex-nowrap">
          <button class="flex h-[34px] min-w-[60px] flex-auto cursor-pointer items-center justify-center truncate px-2.5 transition-colors hover:bg-fill active:bg-raise disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent" :disabled="offsetDisabled" ignore-tip :aria-label="$t('lyric_menu__offset_add_100')" @click="setOffset(100)">+ 100ms</button>
          <button class="flex h-[34px] min-w-[60px] flex-auto cursor-pointer items-center justify-center truncate px-2.5 transition-colors hover:bg-fill active:bg-raise disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent" :disabled="offsetDisabled" ignore-tip :aria-label="$t('lyric_menu__offset_dec_100')" @click="setOffset(-100)">- 100ms</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { computed, ref, watch } from '@common/utils/vueTools'
import useMenuLocation from '@renderer/utils/compositions/useMenuLocation'
import { debounce } from '@common/utils/common'
import { saveLyricEdited, removeLyricEdited } from '@renderer/utils/ipc'
import { appSetting, setPlayDetailLyricFont, setPlayDetailLyricAlign } from '@renderer/store/setting'

const offsetTagRxp = /(?:^|\n)\s*\[offset:\s*(\S+(?:\d+)*)\s*\]/
const offsetTagAllRxp = /(^|\n)\s*\[offset:\s*(\S+(?:\d+)*)\s*\]/g

const saveLyric = debounce((musicInfo, lyricInfo) => {
  void saveLyricEdited(musicInfo, lyricInfo)
})
const removeLyric = debounce(musicInfo => {
  void removeLyricEdited(musicInfo)
})

const getOffset = lrc => {
  let offset = offsetTagRxp.exec(lrc)
  if (offset) {
    offset = parseInt(offset[1])
    if (Number.isNaN(offset)) offset = 0
  } else offset = 0
  return offset
}

export default {
  name: 'LyricMenu',
  props: {
    modelValue: Boolean,
    xy: {
      type: Object,
      required: true,
    },
    lyricInfo: {
      type: Object,
      required: true,
    },
  },
  emits: ['updateLyric', 'update:modelValue'],
  setup(props, { emit }) {
    const offset = ref(0)
    const offsetDisabled = ref(true)
    const originOffset = ref(0)

    const visible = computed(() => props.modelValue)
    const location = computed(() => props.xy)

    const onHide = () => {
      emit('update:modelValue', false)
    }

    const setFontAlign = val => {
      if (appSetting['playDetail.style.align'] == val) return
      setPlayDetailLyricAlign(val)
    }

    const fontSizeUp = step => {
      if (appSetting['playDetail.style.fontSize'] >= 200) return
      setPlayDetailLyricFont(Math.min(appSetting['playDetail.style.fontSize'] + step, 200))
    }
    const fontSizeDown = step => {
      if (appSetting['playDetail.style.fontSize'] <= 70) return
      setPlayDetailLyricFont(Math.max(appSetting['playDetail.style.fontSize'] - step, 70))
    }
    const fontSizeReset = () => {
      setPlayDetailLyricFont(100)
    }

    const updateLyric = offset => {
      let lyric = props.lyricInfo.lyric
      let tlyric = props.lyricInfo.tlyric
      let rlyric = props.lyricInfo.rlyric
      let lxlyric = props.lyricInfo.lxlyric
      if (offsetTagRxp.test(lyric)) {
        lyric = lyric.replace(offsetTagAllRxp, `$1[offset:${offset}]`)
        tlyric &&= tlyric.replace(offsetTagAllRxp, `$1[offset:${offset}]`)
        lxlyric &&= lxlyric.replace(offsetTagAllRxp, `$1[offset:${offset}]`)
        rlyric &&= rlyric.replace(offsetTagAllRxp, `$1[offset:${offset}]`)
      } else {
        lyric &&= `[offset:${offset}]\n` + lyric
        tlyric &&= `[offset:${offset}]\n` + tlyric
        lxlyric &&= `[offset:${offset}]\n` + lxlyric
        rlyric &&= `[offset:${offset}]\n` + rlyric
      }

      const musicInfo = 'progress' in props.lyricInfo.musicInfo ? props.lyricInfo.musicInfo.metadata.musicInfo : props.lyricInfo.musicInfo

      if (offset == originOffset.value) {
        removeLyric(musicInfo)
      } else {
        saveLyric(musicInfo, {
          lyric,
          tlyric,
          rlyric,
          lxlyric,
        })
      }

      emit('updateLyric', {
        lyric,
        tlyric,
        rlyric,
        lxlyric,
        offset,
      })
    }
    const setOffset = step => {
      offset.value += step
      updateLyric(offset.value)
    }
    const offsetReset = () => {
      if (offset.value == originOffset.value) return
      offset.value = originOffset.value
      updateLyric(originOffset.value)
    }

    const parseLrcOffset = () => {
      offset.value = getOffset(props.lyricInfo.lyric)
      originOffset.value = getOffset(props.lyricInfo.rawlyric)
      offsetDisabled.value = !props.lyricInfo.lyric
    }


    const { dom_menu, menuStyles } = useMenuLocation({
      visible,
      location,
      onHide,
    })

    watch(() => props.lyricInfo.musicInfo, () => {
      if (!props.modelValue) return
      parseLrcOffset()
    })
    watch(visible, val => {
      if (!val) return
      parseLrcOffset()
    })

    return {
      appSetting,
      dom_menu,
      menuStyles,
      offset,
      originOffset,
      fontSizeUp,
      fontSizeDown,
      fontSizeReset,
      setOffset,
      offsetReset,
      setFontAlign,
      offsetDisabled,
    }
  },
}
</script>
