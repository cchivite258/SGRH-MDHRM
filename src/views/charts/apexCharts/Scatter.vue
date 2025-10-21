<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/scatter/utils";
import Scatter from "@//components/apexCharts/scatter/index.vue";
</script>
<template>
    <Breadcrumb title="Scatter Charts" :items="breadcrumb" />
    <Scatter />
</template>
