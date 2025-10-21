<script lang="ts" setup>
import { sellersOverviewBreadcrumb } from "@/components/eCommerce/sellersOverview/utils";
import SellersOverview from "@/components/eCommerce/sellersOverview/index.vue";
</script>
<template>
  <Breadcrumb title="Sellers Overview" :items="sellersOverviewBreadcrumb" />
  <SellersOverview />
</template>
