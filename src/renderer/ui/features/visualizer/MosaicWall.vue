<template>
  <!--
    全屏音乐磁贴：把当前播放列表的封面铺成一面缓慢流动的墙。
    纯 CSS 动画（5 列反向滚动 + 整体倾斜），不碰 GPU 上下文，
    所以在 lite 档位也能用，只是不叠 3D 歌词。
  -->
  <div class="absolute inset-0 overflow-hidden">
    <div class="mosaic-plane absolute inset-[-14%] flex gap-2.5">
      <div
        v-for="(column, index) in columns"
        :key="index"
        class="mosaic-column flex min-w-0 flex-1 flex-col gap-2.5"
        :class="index % 2 === 0 ? 'mosaic-column--up' : 'mosaic-column--down'"
        :style="{ animationDuration: `${58 + index * 11}s` }"
      >
        <template v-for="pass in 2" :key="pass">
          <div
            v-for="(pic, picIndex) in column"
            :key="`${pass}-${picIndex}`"
            class="relative aspect-square w-full overflow-hidden rounded-[10px] bg-fill2"
            :style="pic ? undefined : { background: placeholder(index, picIndex) }"
          >
            <img
              v-if="pic"
              :src="pic"
              class="h-full w-full object-cover opacity-80"
              decoding="async"
              loading="lazy"
              alt=""
              aria-hidden="true"
            >
            <span class="pointer-events-none absolute inset-0 rounded-[10px] ring-1 ring-inset ring-white/5" />
          </div>
        </template>
      </div>
    </div>

    <!-- 压暗 + 纵向渐变，保证歌词与面板在磁贴上依然清晰 -->
    <div class="absolute inset-0 bg-bg/55" />
    <div class="absolute inset-0 bg-gradient-to-b from-bg/35 via-bg/55 to-bg" />
  </div>
</template>

<script setup lang="ts">
import { computed } from '@common/utils/vueTools'
import { playedList } from '@renderer/store/player/state'

const props = withDefaults(defineProps<{
  accent?: string
  minPerColumn?: number
}>(), {
  accent: '#f4f4f5',
  minPerColumn: 5,
})

const covers = computed(() => {
  const list: string[] = []
  for (const item of playedList) {
    // 队列里可能是本地歌曲（ListItem），没有 pic 字段
    const pic = (item.musicInfo as { pic?: string } | undefined)?.pic
    if (typeof pic === 'string' && pic.length) list.push(pic)
  }
  // 去重但保留顺序，避免同一张封面连续出现
  return [...new Set(list)]
})

const COLUMN_COUNT = 5

const columns = computed<Array<Array<string | null>>>(() => {
  const pool = covers.value

  return Array.from({ length: COLUMN_COUNT }, (_, columnIndex) => {
    const items: Array<string | null> = []
    for (let i = 0; i < props.minPerColumn; i++) {
      if (!pool.length) {
        items.push(null)
        continue
      }
      // 每列错开起点，滚动时相邻列不会同步出现同一张图
      items.push(pool[(columnIndex * 2 + i) % pool.length])
    }
    return items
  })
})

const placeholder = (columnIndex: number, picIndex: number) => {
  const angle = (columnIndex * 37 + picIndex * 19) % 360
  return `linear-gradient(${angle}deg, ${props.accent}26, ${props.accent}0d 55%, transparent 100%)`
}
</script>

<style scoped>
.mosaic-plane {
  transform: rotate(-8deg) scale(1.16);
}

.mosaic-column {
  animation-name: mosaic-scroll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.mosaic-column--down {
  animation-direction: reverse;
}

@keyframes mosaic-scroll {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mosaic-column {
    animation: none;
  }
}
</style>
