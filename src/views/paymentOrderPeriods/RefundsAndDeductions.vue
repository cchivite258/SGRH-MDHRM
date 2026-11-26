<script lang="ts" setup>
import { listBreadcrumb } from "@/components/paymentOrderPeriod/listView/utils";
import ListView from "@/components/paymentOrderPeriod/listView/index.vue";

const breadcrumb = listBreadcrumb("refunds-and-deductions");
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView section="refunds-and-deductions" />
</template>
