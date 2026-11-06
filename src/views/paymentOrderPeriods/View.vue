<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { PAYMENT_ORDER_PERIOD_LIST_ROUTE, viewBreadcrumb } from "@/components/paymentOrderPeriod/listView/utils";
import ViewBatch from "@/components/paymentOrderPeriod/view/index.vue";

const route = useRoute();
const periodId = computed(() => String(route.params.id));
</script>

<template>
  <Breadcrumb title="view-payment-order-batch" :items="viewBreadcrumb" />
  <ViewBatch :key="periodId" :period-id="periodId" :back-route="PAYMENT_ORDER_PERIOD_LIST_ROUTE" />
</template>
