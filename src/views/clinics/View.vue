<script lang="ts" setup>
import { useRoute } from "vue-router";
import { breadcrumb } from "@/components/clinics/view/utils";
import View from "@/components/clinics/view/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const employeeId = route.params.id;
</script>

<template>
  <Breadcrumb :title="t('view-clinic')" :items="breadcrumb" />
  <View :card-title="t('t-view-clinic')" />
</template>