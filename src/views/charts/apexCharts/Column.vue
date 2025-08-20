<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/column/utils";
import Column from "@/components/apexCharts/column/index.vue";
</script>
<template>
  <Breadcrumb title="Column charts" :items="breadcrumb" />
  <Column />
</template>
