<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/hospitalProcedureGroup/editHospitalProcedureGroup/listView/utils";
import ListView from "@/components/baseTables/hospitalProcedureGroup/editHospitalProcedureGroup/listView/index.vue";
</script>
<template>
  <Breadcrumb title="edit-hospital-procedure-group" :items="breadcrumb" />
  <ListView />
</template>
