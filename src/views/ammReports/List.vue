<script lang="ts" setup>
import { breadcrumb } from "@/components/ammReports/list/utils";
import AmmReportsList from "@/components/ammReports/list/index.vue";
</script>
<template>  
  <Breadcrumb title="reports-list" :items="breadcrumb" />
  <AmmReportsList />
</template>
  
