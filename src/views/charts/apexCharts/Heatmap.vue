<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/heatmap/utils";
import Heatmap from "@/components/apexCharts/heatmap/index.vue";
</script>
<template>
    <Breadcrumb title="Heatmap Charts" :items="breadcrumb" />
    <Heatmap />
</template>
