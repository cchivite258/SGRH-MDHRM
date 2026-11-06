<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { PAYMENT_ORDER_PERIOD_LIST_ROUTE, settleBreadcrumb } from "@/components/paymentOrderPeriod/listView/utils";
import SettleBatch from "@/components/paymentOrderPeriod/settle/index.vue";

const route = useRoute();
const periodId = computed(() => String(route.params.id));
</script>

<template>
  <Breadcrumb title="settle-payment-order-batch" :items="settleBreadcrumb" />
  <SettleBatch :key="periodId" :period-id="periodId" :back-route="PAYMENT_ORDER_PERIOD_LIST_ROUTE" />
</template>
