<script lang="ts" setup>
import { sellersBreadcrumb } from "@/components/eCommerce/sellers/utils";
import Sellers from "@/components/eCommerce/sellers/index.vue";
</script>
<template>
  <Breadcrumb title="Sellers" :items="sellersBreadcrumb" />
  <Sellers />
</template>
