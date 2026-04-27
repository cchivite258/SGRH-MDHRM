<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/hospitalProcedureType/listView/utils";
import ListView from "@/components/baseTables/hospitalProcedureType/listView/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
