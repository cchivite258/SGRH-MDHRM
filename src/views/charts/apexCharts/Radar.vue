<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/radar/utils";
import Radar from "@/components/apexCharts/radar/index.vue";
</script>
<template>
  <Breadcrumb title="Radar Charts" :items="breadcrumb" />
  <Radar />
</template>
