<script lang="ts" setup>
import { breadcrumb } from "@/components/realEstate/overview/utils";
import PropertyOverview from "@/components/realEstate/overview/index.vue";
</script>
<template>
  <Breadcrumb title="Property Overview" :items="breadcrumb" />
  <PropertyOverview />
</template>
