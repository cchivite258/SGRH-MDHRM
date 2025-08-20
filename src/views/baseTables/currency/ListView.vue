<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/currency/listView/utils";
import ListView from "@/components/baseTables/currency/listView/index.vue";
</script>
<template>
  <Breadcrumb title="currency-list" :items="breadcrumb" />
  <ListView />
</template>
