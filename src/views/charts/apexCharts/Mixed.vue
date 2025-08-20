<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/mixed/utils";
import Mixed from "@/components/apexCharts/mixed/index.vue";
</script>
<template>
  <Breadcrumb title="Mixed Charts" :items="breadcrumb" />
  <Mixed />
</template>
