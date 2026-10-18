<template>
  <!--
    Tailwind 构建探针。不参与生产打包，仅用于验证：
    1. p-3 / rounded-xl 等工具类真的生效（没被 reset.less 的 div{padding:0} 盖掉）
    2. backdrop-blur / 自定义 @utility / @theme inline 映射都能生成
    验证方式：构建后 grep dist/renderer.css 里是否有 .p-3 / .app-drag / .bg-ui-bg
  -->
  <div class="app-drag flex gap-2 rounded-xl bg-bg p-3 text-[13px] text-fg backdrop-blur-xl">
    <span class="text-accent">tailwind</span>
    <span class="text-t2">probe</span>
  </div>
</template>

<script setup lang="ts">
</script>
