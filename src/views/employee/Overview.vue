<script lang="ts" setup>
import { breadcrumb } from "@/components/employee/overview/utils";
import Overview from "@/components/employee/overview/index.vue";
</script>
<template>
  <Breadcrumb title="Invoice Overview" :items="breadcrumb" />
  <Overview />
</template>
