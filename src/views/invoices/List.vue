<script lang="ts" setup>
import { breadcrumb } from "@/components/invoice/list/utils";
import InvoiceList from "@/components/invoice/list/index.vue";
</script>
<template>
  <Breadcrumb title="invoice-list" :items="breadcrumb" />
  <InvoiceList />
</template>
