<script lang="ts" setup>
import { overviewBreadcrumb } from "@/components/learning/courses/overview/utils";
import Overview from "@/components/learning/courses/overview/index.vue";
</script>
<template>
  <Breadcrumb title="Overview" :items="overviewBreadcrumb" />
  <Overview />
</template>
