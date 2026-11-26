<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { listBreadcrumb, resolveProcessSection } from "@/components/paymentOrderPeriod/listView/utils";
import ListView from "@/components/paymentOrderPeriod/listView/index.vue";

const route = useRoute();
const section = computed(() => resolveProcessSection(route.meta.section));
const breadcrumb = computed(() => listBreadcrumb(section.value));
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView :key="section" :section="section" />
</template>
