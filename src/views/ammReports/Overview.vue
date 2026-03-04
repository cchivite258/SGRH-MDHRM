<script lang="ts" setup>
import { breadcrumb } from "@/components/serviceProvider/overview/utils";
import Overview from "@/components/serviceProvider/overview/index.vue";
</script>
<template>
  <Breadcrumb title="Invoice Overview" :items="breadcrumb" />
  <Overview />
</template>
