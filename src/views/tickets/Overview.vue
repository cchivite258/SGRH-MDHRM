<script lang="ts" setup>
import { breadcrumb } from "@/components/tickets/overview/utils";
import Overview from "@/components/tickets/overview/index.vue";
</script>
<template>
  <Breadcrumb title="Overview" :items="breadcrumb" />
  <Overview />
</template>
