<script lang="ts" setup>
import { breadcrumb } from "@/components/clinics/create/utils";
import Create from "@/components/clinics/create/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <Breadcrumb :title="t('add-clinic')" :items="breadcrumb" />
  <Create :card-title="t('t-add-clinic')" />
</template>