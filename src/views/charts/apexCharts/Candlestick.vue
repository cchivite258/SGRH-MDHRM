<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/candlestick/utils";
import Candlestick from "@/components/apexCharts/candlestick/index.vue";
</script>
<template>
    <Breadcrumb title="Candlestick Charts" :items="breadcrumb" />
    <Candlestick />
</template>
