<template>
  <div class="relative shrink-0">
    <button
      ref="dom_btn"
      type="button"
      class="flex h-8 items-center gap-1 rounded-[10px] px-2.5 text-[12.5px] transition-colors duration-150"
      :class="popupVisible ? 'bg-fill2 text-fg' : 'text-t2 hover:bg-fill hover:text-fg'"
      @click.stop="handleShow"
    >
      <span class="max-w-[8rem] truncate">{{ tagName }}</span>
      <ChevronDown
        :size="14"
        :stroke-width="2"
        class="shrink-0 transition-transform duration-150 ease-ui"
        :class="popupVisible ? 'rotate-180' : ''"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-ui"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-ui"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="popupVisible"
        class="absolute left-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[12px] border border-line bg-menu p-3 shadow-[0_16px_40px_rgba(0,0,0,0.36)]"
        :style="popupStyle"
        @click.stop
      >
        <div class="ui-scroll h-full overflow-y-auto pr-1">
          <div class="mb-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              class="rounded-full px-2.5 py-1 text-[12px] transition-colors duration-100"
              :class="!props.tagId ? 'bg-accent text-on-accent' : 'bg-fill text-t2 hover:bg-fill2 hover:text-fg'"
              @click="handleToggleTag('')"
            >{{ $t('default') }}</button>
          </div>

          <dl v-for="tagInfo in list" :key="tagInfo.name" class="mb-3 last:mb-0">
            <dt class="mb-1.5 text-[11px] text-t3">{{ tagInfo.name }}</dt>
            <dd class="flex flex-wrap gap-1.5">
              <button
                v-for="tag in tagInfo.list"
                :key="tag.id"
                type="button"
                class="rounded-full px-2.5 py-1 text-[12px] transition-colors duration-100"
                :class="tag.id === props.tagId
                  ? 'bg-accent text-on-accent'
                  : 'bg-fill text-t2 hover:bg-fill2 hover:text-fg'"
                @click="handleToggleTag(tag.id)"
              >{{ tag.name }}</button>
            </dd>
          </dl>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { watch, shallowReactive, ref, onMounted, onBeforeUnmount, computed, reactive } from '@common/utils/vueTools'
import { ChevronDown } from 'lucide-vue-next'
import { setTags, getTags } from '@renderer/store/songList/action'
import { tags } from '@renderer/store/songList/state'
import { useRouter, useRoute } from '@common/utils/vueRouter'
import { useI18n } from '@renderer/plugins/i18n'

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
  tagId: {
    type: String,
    required: true,
  },
  sortId: {
    type: [String, undefined],
    default: undefined,
  },
})

const router = useRouter()
const route = useRoute()
const t = useI18n()

const list = shallowReactive([])
const handleToggleTag = (id) => {
  void router.replace({
    path: route.path,
    query: {
      source: props.source,
      tagId: id,
      sortId: props.sortId,
    },
  })
  handleHide()
}
watch(() => props.source, async(source) => {
  if (!source) return
  let tagInfo = tags[source]
  if (tagInfo == null) setTags(tagInfo = await getTags(source), source)

  list.splice(0, list.length, ...[{ name: window.i18n.t('songlist__tag_info_hot_tag'), list: [...tagInfo.hotTag] }, ...tagInfo.tags])
}, {
  immediate: true,
})
const tagName = computed(() => {
  if (!props.tagId) return t('default')
  for (const tags of list) {
    const tag = tags.list.find(t => t.id == props.tagId)
    if (tag) return tag.name
  }
  return props.tagId
})

const popupStyle = reactive({
  width: '645px',
  maxHeight: '250px',
})

const setTagPopupWidth = () => {
  window.setTimeout(() => {
    const dom_view = document.getElementById('view')
    popupStyle.width = dom_view.clientWidth * 0.96 + 'px'
    popupStyle.maxHeight = dom_view.clientHeight * 0.65 + 'px'
  }, 50)
}

const dom_btn = ref(null)
const popupVisible = ref(false)
const handleShow = () => popupVisible.value = !popupVisible.value
const handleHide = (evt) => {
  if (evt && (evt.target == dom_btn.value || dom_btn.value?.contains(evt.target))) return
  popupVisible.value = false
}


onMounted(() => {
  setTagPopupWidth()
  document.addEventListener('click', handleHide)
  window.addEventListener('resize', setTagPopupWidth)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleHide)
  window.removeEventListener('resize', setTagPopupWidth)
})
</script>
