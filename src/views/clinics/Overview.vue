<script lang="ts" setup>
import { breadcrumb } from "@/components/clinics/overview/utils";
import Overview from "@/components/clinics/overview/index.vue";
</script>
<template>
  <Breadcrumb title="Invoice Overview" :items="breadcrumb" />
  <Overview />
</template>
