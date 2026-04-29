<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/hospitalProcedureGroup/listView/utils";
import ListView from "@/components/baseTables/hospitalProcedureGroup/listView/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>

