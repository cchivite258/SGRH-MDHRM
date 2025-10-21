<script lang="ts" setup>
import { breadcrumb } from "@/components/apexCharts/rangeArea/utils";
import RangeArea from "@/components/apexCharts/rangeArea/index.vue";
</script>
<template>
    <Breadcrumb title="Range Area Charts" :items="breadcrumb" />
    <RangeArea />
</template>
