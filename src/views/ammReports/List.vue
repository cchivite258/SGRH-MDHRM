<script lang="ts" setup>
import { breadcrumb } from "@/components/ammReports/list/utils";
import AmmReportsList from "@/components/ammReports/list/index.vue";
</script>
<template>  
  <Breadcrumb :items="breadcrumb" />
  <AmmReportsList />
</template>
  
