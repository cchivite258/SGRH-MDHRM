<script lang="ts" setup>
import { orderOverviewBreadcrumb } from "@/components/eCommerce/orderOverview/utils";
import OrderOverview from "@/components/eCommerce/orderOverview/index.vue";
</script>
<template>
  <Breadcrumb title="Order Overview" :items="orderOverviewBreadcrumb" />
  <OrderOverview />
</template>
