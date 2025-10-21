<script lang="ts" setup>
import { listBreadcrumb } from "@/components/learning/courses/listView/utils";
import ListView from "@/components/learning/courses/listView/index.vue";
</script>
<template>
  <Breadcrumb title="List View" :items="listBreadcrumb" />
  <ListView />
</template>
