<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/boxplot/utils";
import Boxplot from "@/components/apexCharts/boxplot/index.vue";
</script>
<template>
  <Breadcrumb title="Boxplot Charts" :items="breadcrumb" />
  <Boxplot />
</template>
