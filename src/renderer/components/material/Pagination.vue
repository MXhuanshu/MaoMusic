<template>
  <div v-if="maxPage > 1" class="inline-block">
    <ul class="flex flex-row flex-nowrap overflow-hidden rounded-[10px] bg-fill text-[13px] text-t2">
      <li v-if="page == 1" class="flex opacity-30">
        <span class="block px-3 py-[7px] leading-tight">
          <svg version="1.1" class="h-[1em]" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 451.846 451.847" space="preserve">
            <use xlink:href="#icon-left" />
          </svg>
        </span>
      </li>
      <li v-else class="flex">
        <button type="button" class="block cursor-pointer px-3 py-[7px] leading-tight transition-colors hover:bg-raise hover:text-fg" :aria-label="$t('pagination__prev')" @click="handleClick(page - 1)">
          <svg version="1.1" class="h-[1em]" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 451.846 451.847" space="preserve">
            <use xlink:href="#icon-left" />
          </svg>
        </button>
      </li>
      <li v-if="maxPage > btnLength && page > pageEvg+1" class="flex">
        <button type="button" class="block cursor-pointer px-3 py-[7px] leading-none transition-colors hover:bg-raise hover:text-fg" :aria-label="$t('pagination__page', { num: 1 })" @click="handleClick(1)">
          <svg version="1.1" class="h-[1em]" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 451.846 451.847" space="preserve">
            <use xlink:href="#icon-first" />
          </svg>
        </button>
      </li>
      <li v-for="p in pages" :key="p" class="flex">
        <span v-if="p === page" class="block bg-raise px-3 py-[7px] leading-tight text-fg" v-text="page" />
        <button v-else type="button" class="block cursor-pointer px-3 py-[7px] leading-tight transition-colors hover:bg-raise hover:text-fg" :aria-label="$t('pagination__page', { num: p })" @click="handleClick(p)" v-text="p" />
      </li>
      <li v-if="maxPage > btnLength && maxPage - page > pageEvg" class="flex">
        <button type="button" class="block cursor-pointer px-3 py-[7px] leading-none transition-colors hover:bg-raise hover:text-fg" :aria-label="$t('pagination__page', { num: maxPage })" @click="handleClick(maxPage)">
          <svg version="1.1" class="h-[1em]" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 451.846 451.847" space="preserve">
            <use xlink:href="#icon-last" />
          </svg>
        </button>
      </li>
      <li v-if="page == maxPage" class="flex opacity-30">
        <span class="block px-3 py-[7px] leading-tight">
          <svg version="1.1" class="h-[1em]" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 451.846 451.847" space="preserve">
            <use xlink:href="#icon-right" />
          </svg>
        </span>
      </li>
      <li v-else class="flex">
        <button type="button" class="block cursor-pointer px-3 py-[7px] leading-tight transition-colors hover:bg-raise hover:text-fg" :aria-label="$t('pagination__next')" @click="handleClick(page + 1)">
          <svg version="1.1" class="h-[1em]" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 451.846 451.847" space="preserve">
            <use xlink:href="#icon-right" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { computed } from '@common/utils/vueTools'

export default {
  props: {
    count: {
      type: Number,
      default: 0,
    },
    limit: {
      type: Number,
      default: 10,
    },
    page: {
      type: Number,
      default: 1,
    },
    btnLength: {
      type: Number,
      default: 7,
    },
  },
  emits: ['btn-click'],
  setup(props, { emit }) {
    const maxPage = computed(() => {
      return Math.ceil(props.count / props.limit) || 1
    })
    const pageEvg = computed(() => {
      return Math.floor(props.btnLength / 2)
    })
    const pages = computed(() => {
      if (maxPage.value <= props.btnLength) return Array.from({ length: maxPage.value }, (_, i) => i + 1)
      let start = props.page - pageEvg.value > 1
        ? maxPage.value - props.page < pageEvg.value + 1
          ? maxPage.value - (props.btnLength - 1)
          : props.page - pageEvg.value
        : 1
      return Array.from({ length: props.btnLength }, (_, i) => start + i)
    })

    const handleClick = (page) => {
      emit('btn-click', page)
    }

    return {
      maxPage,
      pageEvg,
      pages,
      handleClick,
    }
  },
}
</script>
