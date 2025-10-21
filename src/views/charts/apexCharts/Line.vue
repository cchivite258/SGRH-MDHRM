<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/line/utils";
import Line from "@/components/apexCharts/line/index.vue";
</script>
<template>
  <Breadcrumb title="Line charts" :items="breadcrumb" />
  <Line />
</template>
