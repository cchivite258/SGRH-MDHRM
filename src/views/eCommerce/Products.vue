<script lang="ts" setup>
import { productBreadcrumb } from "@/components/eCommerce/products/utils";
import Products from "@/components/eCommerce/products/index.vue";
</script>
<template>
  <Breadcrumb title="Products" :items="productBreadcrumb" />
  <Products />
</template>
