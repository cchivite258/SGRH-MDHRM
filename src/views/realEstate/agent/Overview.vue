<script lang="ts" setup>
import { breadcrumb } from "@/components/realEstate/agent/overview/utils";
import OverView from "@/components/realEstate/agent/overview/index.vue";
</script>
<template>
  <Breadcrumb title="Overview" :items="breadcrumb" />
  <OverView />
</template>
