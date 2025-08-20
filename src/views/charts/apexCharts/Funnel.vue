<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/funnel/utils";
import Funnel from "@/components/apexCharts/funnel/index.vue";
</script>
<template>
    <Breadcrumb title="Funnel Charts" :items="breadcrumb" />
    <Funnel />
</template>
