<template>
  <UiTabs
    :model-value="sortId"
    :list="tabList"
    class="ml-1 min-w-0"
    @change="handleToggle"
  />
</template>

<script setup>
import { computed, shallowReactive, watch } from '@common/utils/vueTools'
import { sortList } from '@renderer/store/songList/state'
import { useRouter, useRoute } from '@common/utils/vueRouter'
import UiTabs from '@renderer/ui/primitives/UiTabs.vue'

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
    type: String,
    default: '',
  },
})

const router = useRouter()
const route = useRoute()

const list = shallowReactive([])

/** UiTabs 要 {id,label}，音源返回的是 {id,name} */
const tabList = computed(() => list.map(item => ({ id: item.id, label: item.name })))

const handleToggle = (id) => {
  void router.replace({
    path: route.path,
    query: {
      source: props.source,
      tagId: props.tagId,
      sortId: id,
    },
  })
}
watch(() => props.source, async(source) => {
  if (!source) return
  let _list = sortList[source] ?? []
  list.splice(0, list.length, ..._list)
  if (!props.sortId && list.length) handleToggle(list[0].id)
}, {
  immediate: true,
})
</script>
