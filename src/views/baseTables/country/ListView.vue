<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/country/listView/utils";
import ListView from "@/components/baseTables/country/listView/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
