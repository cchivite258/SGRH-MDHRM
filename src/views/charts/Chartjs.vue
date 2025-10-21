<script lang="ts" setup>
import { breadcrumb } from "@/components/charts/chartjs/utils";
import Chartjs from "@/components/charts/chartjs/index.vue";
</script>
<template>
  <Breadcrumb title="Chartjs" :items="breadcrumb" />
  <Chartjs />
</template>
