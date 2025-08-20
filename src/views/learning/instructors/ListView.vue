<script lang="ts" setup>
import { breadcrumb } from "@/components/learning/instructors/listView/utils";
import ListView from "@/components/learning/instructors/listView/index.vue";
</script>
<template>
  <Breadcrumb title="List View" :items="breadcrumb" />
  <ListView />
</template>
