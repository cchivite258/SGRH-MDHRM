<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/pie/utils";
import Pie from "@/components/apexCharts/pie/index.vue";
</script>
<template>
  <Breadcrumb title="Pie Charts" :items="breadcrumb" />
  <Pie />
</template>
