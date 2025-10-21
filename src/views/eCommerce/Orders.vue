<script lang="ts" setup>
import { orderBreadcrumb } from "@/components/eCommerce/orders/utils";
import Orders from "@/components/eCommerce/orders/index.vue";
</script>
<template>
  <Breadcrumb title="Orders" :items="orderBreadcrumb" />
  <Orders />
</template>
