<script lang="ts" setup>
import { productOverviewBreadcrumb } from "@/components/eCommerce/ProductDetails/utils";
import ProductDetails from "@/components/eCommerce/ProductDetails/index.vue";
</script>
<template>
  <Breadcrumb title="Product Overview" :items="productOverviewBreadcrumb" />
  <ProductDetails />
</template>
