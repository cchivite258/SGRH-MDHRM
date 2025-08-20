<script lang="ts" setup>
import { useRoute } from "vue-router";
import { breadcrumb } from "@/components/invoice/createInvoice/utils";
import Edit from "@/components/invoice/createInvoice/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const invoiceId = route.params.id;
</script>

<template>
  <Breadcrumb :title="t('edit-invoice')" :items="breadcrumb" />
  <Edit :card-title="t('t-edit-invoice')" />
</template>