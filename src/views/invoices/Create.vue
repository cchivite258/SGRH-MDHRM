<script lang="ts" setup>
import { breadcrumb } from "@/components/invoice/createInvoice/utils";
import CreateInvoice from "@/components/invoice/createInvoice/index.vue";
</script>
<template>
  <Breadcrumb title="create-invoice" :items="breadcrumb" />
  <CreateInvoice />
</template>
