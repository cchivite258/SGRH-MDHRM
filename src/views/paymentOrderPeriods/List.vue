<script lang="ts" setup>
import { breadcrumb } from "@/components/paymentOrderPeriod/listView/utils";
import ListView from "@/components/paymentOrderPeriod/listView/index.vue";
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
