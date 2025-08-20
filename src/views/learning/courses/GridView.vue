<script lang="ts" setup>
import { gridBreadcrumb } from "@/components/learning/courses/gridView/utils";
import GridView from "@/components/learning/courses/gridView/index.vue";
</script>
<template>
  <Breadcrumb title="Grid View" :items="gridBreadcrumb" />
  <GridView />
</template>
