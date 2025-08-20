<script lang="ts" setup>
import { customersBreadcrumb } from "@/components/eCommerce/customers/utils";
import Customers from "@/components/eCommerce/customers/index.vue";
</script>
<template>
  <Breadcrumb title="Customers" :items="customersBreadcrumb" />
  <Customers />
</template>
