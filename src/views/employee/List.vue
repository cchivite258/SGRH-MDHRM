<script lang="ts" setup>
import { breadcrumb } from "@/components/employee/list/utils";
import EmployeeList from "@/components/employee/list/index.vue";
</script>
<template>
  <Breadcrumb title="employee-list" :items="breadcrumb" />
  <EmployeeList />
</template>
