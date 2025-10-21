<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/TaxRate/listView/utils";
import ListView from "@/components/baseTables/TaxRate/listView/index.vue";
</script>
<template>
  <Breadcrumb title="tax-rates-list" :items="breadcrumb" />
  <ListView />
</template>
