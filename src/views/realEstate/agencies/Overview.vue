<script lang="ts" setup>
import { breadcrumb } from "@/components/realEstate/agencies/overview/utils";
import Overview from "@/components/realEstate/agencies/overview/index.vue";
</script>
<template>
  <Breadcrumb title="Overview" :items="breadcrumb" />
  <Overview />
</template>
