<script lang="ts" setup>
import { checkoutBreadcrumb } from "@/components/eCommerce/checkout/utils";
import Checkout from "@/components/eCommerce/checkout/index.vue";
</script>
<template>
  <Breadcrumb title="Checkout" :items="checkoutBreadcrumb" />
  <Checkout />
</template>
