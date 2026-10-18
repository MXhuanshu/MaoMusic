<template>
  <div v-if="maxPage > 1" class="flex items-center justify-center gap-1 py-4">
    <button
      type="button"
      class="grid h-7 min-w-7 place-items-center rounded-lg px-1.5 text-[12px] transition-colors duration-150"
      :class="page <= 1 ? 'cursor-default text-t3 opacity-40' : 'text-t2 hover:bg-fill hover:text-fg'"
      :disabled="page <= 1"
      :aria-label="$t('pagination__prev')"
      @click="handleClick(page - 1)"
    >
      <ChevronLeft :size="15" :stroke-width="2" />
    </button>

    <button
      v-if="maxPage > btnLength && page > pageEvg + 1"
      type="button"
      class="grid h-7 min-w-7 place-items-center rounded-lg text-[12px] text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
      :aria-label="$t('pagination__page', { num: 1 })"
      @click="handleClick(1)"
    >1</button>

    <button
      v-for="p in pages"
      :key="p"
      type="button"
      class="grid h-7 min-w-7 place-items-center rounded-lg px-1.5 text-[12px] transition-colors duration-150"
      :class="p === page
        ? 'bg-accent font-medium text-on-accent'
        : 'text-t2 hover:bg-fill hover:text-fg'"
      :aria-label="$t('pagination__page', { num: p })"
      @click="p === page || handleClick(p)"
    >{{ p }}</button>

    <button
      v-if="maxPage > btnLength && maxPage - page > pageEvg"
      type="button"
      class="grid h-7 min-w-7 place-items-center rounded-lg text-[12px] text-t2 transition-colors duration-150 hover:bg-fill hover:text-fg"
      :aria-label="$t('pagination__page', { num: maxPage })"
      @click="handleClick(maxPage)"
    >{{ maxPage }}</button>

    <button
      type="button"
      class="grid h-7 min-w-7 place-items-center rounded-lg px-1.5 text-[12px] transition-colors duration-150"
      :class="page >= maxPage ? 'cursor-default text-t3 opacity-40' : 'text-t2 hover:bg-fill hover:text-fg'"
      :disabled="page >= maxPage"
      :aria-label="$t('pagination__next')"
      @click="handleClick(page + 1)"
    >
      <ChevronRight :size="15" :stroke-width="2" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from '@common/utils/vueTools'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  count?: number
  limit?: number
  page?: number
  btnLength?: number
}>(), {
  count: 0,
  limit: 10,
  page: 1,
  btnLength: 7,
})

const emit = defineEmits<{
  'btn-click': [page: number]
}>()

const maxPage = computed(() => Math.max(1, Math.ceil(props.count / props.limit)))
const pageEvg = computed(() => Math.floor(props.btnLength / 2))

const pages = computed(() => {
  const list: number[] = []
  let start = Math.max(1, props.page - pageEvg.value)
  let end = Math.min(maxPage.value, start + props.btnLength - 1)
  start = Math.max(1, end - props.btnLength + 1)
  for (let index = start; index <= end; index += 1) list.push(index)
  return list
})

const handleClick = (page: number) => {
  if (page < 1 || page > maxPage.value || page === props.page) return
  emit('btn-click', page)
}
</script>
