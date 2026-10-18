<template>
  <!--
    设置区块容器：标题 + 内容，对应旧模板里的 <dt>/<dd>。
    用滑动条形式划分区块，比旧的分隔线更像 Folia。
  -->
  <section class="border-b border-line pb-2 pt-5 last:border-b-0">
    <h3
      v-if="title"
      class="mb-1 flex items-center gap-2 px-1 text-[11px] font-medium uppercase tracking-wider text-t3"
    >
      <span>{{ title }}</span>
      <span class="h-px flex-1 bg-line" />
    </h3>
    <div class="px-1">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
}>(), {
  title: '',
})
</script>
