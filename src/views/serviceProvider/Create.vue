<script lang="ts" setup>
import { breadcrumb } from "@/components/serviceProvider/create/utils";
import Create from "@/components/serviceProvider/create/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <Breadcrumb :title="t('add-service-provider')" :items="breadcrumb" />
  <Create :card-title="t('t-add-service-provider')" />
</template>