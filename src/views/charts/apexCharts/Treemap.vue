<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/treemap/utils";
import Treemap from "@/components/apexCharts/treemap/index.vue";
</script>
<template>
    <Breadcrumb title="Treemap Charts" :items="breadcrumb" />
    <Treemap />
</template>
