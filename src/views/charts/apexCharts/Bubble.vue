<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/bubble/utils";
import Bubble from "@/components/apexCharts/bubble/index.vue";
</script>
<template>
    <Breadcrumb title="Bubble Charts" :items="breadcrumb" />
    <Bubble />
</template>
