<script lang="ts" setup>
import { breadcrumb } from "@/components/learning/instructors/gridView/utils";
import GridView from "@/components/learning/instructors/gridView/index.vue";
</script>
<template>
  <Breadcrumb title="Grid View" :items="breadcrumb" />
  <GridView />
</template>
