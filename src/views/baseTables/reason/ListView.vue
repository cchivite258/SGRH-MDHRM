<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/reason/listView/utils";
import ListView from "@/components/baseTables/reason/listView/index.vue";
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>

