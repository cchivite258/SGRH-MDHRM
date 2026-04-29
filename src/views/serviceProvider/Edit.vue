<script lang="ts" setup>
import { useRoute } from "vue-router";
import { breadcrumb } from "@/components/serviceProvider/create/utils";
import Create from "@/components/serviceProvider/create/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const serviceProviderId = route.params.id;
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <Create :card-title="t('t-edit-service-provider')" />
</template>
