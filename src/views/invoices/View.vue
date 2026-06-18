<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { breadcrumb as defaultBreadcrumb } from "@/components/invoice/view/utils";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import View from "@/components/invoice/view/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const invoiceId = route.params.id;

const returnTo = computed(() => {
  const value = route.query.returnTo;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : "";
});

const returnTitle = computed(() => {
  const value = route.query.returnTitle;
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "invoices";
});

const breadcrumb = computed<BreadcrumbType[]>(() => {
  if (!returnTo.value) return defaultBreadcrumb;

  return [
    {
      title: returnTitle.value,
      disabled: false,
      to: returnTo.value
    },
    {
      title: "view-invoice",
      disabled: true
    }
  ];
});
</script>

<template>
  <Breadcrumb title="view-invoice" :items="breadcrumb" />
  <View :card-title="t('t-view-invoice')" />
</template>
