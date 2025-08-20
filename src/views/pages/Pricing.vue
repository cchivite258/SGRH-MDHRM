<script lang="ts" setup>
import { breadcrumb } from "@/components/pages/pricing/utils";
import Pricing from "@/components/pages/pricing/index.vue";
</script>
<template>
  <Breadcrumb title="Pricing" :items="breadcrumb" />
  <Pricing />
</template>
