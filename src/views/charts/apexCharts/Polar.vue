<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/polar/utils";
import Polar from "@/components/apexCharts/polar/index.vue";
</script>
<template>
  <Breadcrumb title="Polar Charts" :items="breadcrumb" />
  <Polar />
</template>
