<script lang="ts" setup>
import { productCartBreadcrumb } from "@/components/eCommerce/shopCart/utils";
import ShopCart from "@/components/eCommerce/shopCart/index.vue";
</script>
<template>
  <Breadcrumb title="Shop Cart" :items="productCartBreadcrumb" />
  <ShopCart />
</template>
