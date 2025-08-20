<script lang="ts" setup>
import { breadcrumb } from "@/components/realEstate/earnings/utils";
import Earnings from "@/components/realEstate/earnings/index.vue";
</script>
<template>
  <Breadcrumb title="Earnings" :items="breadcrumb" />
  <Earnings />
</template>
