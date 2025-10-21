<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/radialbar/utils";
import Radialbar from "@/components/apexCharts/radialbar/index.vue";
</script>
<template>
  <Breadcrumb title="Radialbar Charts" :items="breadcrumb" />
  <Radialbar />
</template>
