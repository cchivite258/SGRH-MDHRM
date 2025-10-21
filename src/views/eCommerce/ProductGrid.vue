<script lang="ts" setup>
import { productGridBreadcrumb } from "@/components/eCommerce/productGrid/utils";
import ProductGrid from "@/components/eCommerce/productGrid/index.vue";
</script>
<template>
  <Breadcrumb title="Products Grid" :items="productGridBreadcrumb" />
  <ProductGrid />
</template>
