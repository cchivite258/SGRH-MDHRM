<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/institutionTypes/listView/utils";
import ListView from "@/components/baseTables/institutionTypes/listView/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
