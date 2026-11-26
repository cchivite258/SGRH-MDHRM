<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  processSectionRoute,
  resolveProcessSection,
  settleBreadcrumbFor,
} from "@/components/paymentOrderPeriod/listView/utils";
import SettleBatch from "@/components/paymentOrderPeriod/settle/index.vue";

const route = useRoute();
const periodId = computed(() => String(route.params.id));
const section = computed(() => resolveProcessSection(route.query.section || "refunds-and-deductions"));
const breadcrumb = computed(() => settleBreadcrumbFor(section.value));
const backRoute = computed(() => processSectionRoute(section.value));
</script>

<template>
  <Breadcrumb title="settle-payment-order-batch" :items="breadcrumb" />
  <SettleBatch :key="periodId" :period-id="periodId" :back-route="backRoute" :section="section" />
</template>
