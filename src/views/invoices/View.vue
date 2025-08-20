<script lang="ts" setup>
import { useRoute } from "vue-router";
import { breadcrumb } from "@/components/invoice/view/utils";
import View from "@/components/invoice/view/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const invoiceId = route.params.id;
</script>

<template>
  <Breadcrumb :title="t('view-invoice')" :items="breadcrumb" />
  <View :card-title="t('t-view-invoice')" />
</template>