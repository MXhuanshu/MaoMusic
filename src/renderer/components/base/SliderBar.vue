<template>
  <div
    class="relative flex w-[100px] flex-none items-center py-1.5 opacity-50 transition-opacity duration-150 ease-ui hover:opacity-100"
    :class="[disabled ? 'opacity-30' : '', className]"
  >
    <div class="relative h-[5px] w-full overflow-hidden rounded-full bg-accent/25">
      <div
        ref="dom_sliderBar"
        class="absolute inset-y-0 left-0 w-full origin-left bg-fg shadow-[0_0_2px_rgba(0,0,0,.2)] transition-transform duration-200 ease-linear"
        :style="{ transform: `scaleX(${(value - min) / (max - min) || 0})` }"
      />
    </div>
    <div class="absolute inset-0 cursor-pointer" :class="disabled ? 'cursor-default' : ''" @mousedown="handleSliderMsDown" />
  </div>
</template>

<script>
import { ref, onBeforeUnmount } from '@common/utils/vueTools'

export default {
  props: {
    className: {
      type: String,
      default: '',
    },
    value: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      default: 1,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const sliderEvent = {
      isMsDown: false,
      msDownX: 0,
      msDownRatio: 0,
    }
    const dom_sliderBar = ref(null)

    const clampValue = val => {
      if (val < props.min) return props.min
      if (val > props.max) return props.max
      return val
    }
    const getSteppedValue = val => {
      const step = props.step > 0 ? props.step : 1
      const stepped = Math.round((val - props.min) / step) * step + props.min
      return clampValue(Number(stepped.toFixed(10)))
    }
    const getSliderWidth = () => dom_sliderBar.value?.clientWidth || 0
    const getRange = () => props.max - props.min
    const emitSteppedValue = rawValue => {
      const value = getSteppedValue(rawValue)
      emit('change', value)
      return value
    }

    const handleSliderMsDown = event => {
      if (props.disabled) return
      const width = getSliderWidth()
      if (!width) return

      sliderEvent.isMsDown = true
      sliderEvent.msDownX = event.clientX

      const rawValue = (event.offsetX / width) * getRange() + props.min
      const value = emitSteppedValue(rawValue)
      sliderEvent.msDownRatio = getRange() === 0 ? 0 : (value - props.min) / getRange()
    }
    const handleSliderMsUp = () => {
      sliderEvent.isMsDown = false
    }
    const handleSliderMsMove = event => {
      if (!sliderEvent.isMsDown || props.disabled) return
      const width = getSliderWidth()
      if (!width) return

      const ratio = sliderEvent.msDownRatio + (event.clientX - sliderEvent.msDownX) / width
      const rawValue = ratio * getRange() + props.min
      emitSteppedValue(rawValue)
    }

    document.addEventListener('mousemove', handleSliderMsMove)
    document.addEventListener('mouseup', handleSliderMsUp)
    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', handleSliderMsMove)
      document.removeEventListener('mouseup', handleSliderMsUp)
    })

    return {
      handleSliderMsDown,
      dom_sliderBar,
    }
  },
}
</script>
