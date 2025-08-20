<script lang="ts" setup>
import { addProductBreadcrumb } from "@/components/eCommerce/addProduct/utils";
import AddProduct from "@/components/eCommerce/addProduct/index.vue";
</script>
<template>
  <Breadcrumb title="Add Product" :items="addProductBreadcrumb" />
  <AddProduct />
</template>
