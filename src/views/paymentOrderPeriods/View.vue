<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  processSectionRoute,
  resolveProcessSection,
  viewBreadcrumbFor,
} from "@/components/paymentOrderPeriod/listView/utils";
import ViewBatch from "@/components/paymentOrderPeriod/view/index.vue";

const route = useRoute();
const periodId = computed(() => String(route.params.id));
const section = computed(() => resolveProcessSection(route.query.section));
const breadcrumb = computed(() => viewBreadcrumbFor(section.value));
const backRoute = computed(() => processSectionRoute(section.value));
</script>

<template>
  <Breadcrumb title="view-payment-order-batch" :items="breadcrumb" />
  <ViewBatch :key="periodId" :period-id="periodId" :back-route="backRoute" :section="section" />
</template>
