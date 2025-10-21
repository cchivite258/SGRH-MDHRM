<script lang="ts" setup>
import { breadcrumb } from "@/components/invoice/overview/utils";
import Overview from "@/components/invoice/overview/index.vue";
</script>
<template>
  <Breadcrumb title="Invoice Overview" :items="breadcrumb" />
  <Overview />
</template>
