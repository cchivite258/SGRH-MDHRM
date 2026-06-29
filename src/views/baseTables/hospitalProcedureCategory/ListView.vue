<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/hospitalProcedureCategory/listView/utils";
import ListView from "@/components/baseTables/hospitalProcedureCategory/listView/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>


