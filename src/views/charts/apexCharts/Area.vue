<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/area/utils";
import Area from "@/components/apexCharts/area/index.vue";
</script>
<template>
  <Breadcrumb title="Area charts" :items="breadcrumb" />
  <Area />
</template>
