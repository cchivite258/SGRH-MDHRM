<script lang="ts" setup>
import { breadcrumb } from "@/components/maps/amchart/utils";
import AmChart from "@/components/maps/amchart/index.vue";
</script>

<template>
  <Breadcrumb title="AmChart" :items="breadcrumb" />
  <AmChart />
</template>
