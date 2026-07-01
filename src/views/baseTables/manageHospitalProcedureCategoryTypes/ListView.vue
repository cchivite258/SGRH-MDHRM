<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/hospitalProcedureCategory/manageProcedureTypes/listView/utils";
import ListView from "@/components/baseTables/hospitalProcedureCategory/manageProcedureTypes/listView/index.vue";
</script>

<template>
  <Breadcrumb title="edit-hospital-procedure-category" :items="breadcrumb" />
  <ListView />
</template>
