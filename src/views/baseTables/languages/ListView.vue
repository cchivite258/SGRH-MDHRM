<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/languages/listView/utils";
import ListView from "@/components/baseTables/languages/listView/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
