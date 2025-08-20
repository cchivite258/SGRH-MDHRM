<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/bar/utils";
import Bar from "@/components/apexCharts/bar/index.vue";
</script>
<template>
  <Breadcrumb title="Bar charts" :items="breadcrumb" />
  <Bar />
</template>
