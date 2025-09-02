<script lang="ts" setup>
import { breadcrumbHealthPlan } from "@/components/employee/create/utils";
import List from "@/components/employee/create/ViewUsages.vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const healthPlanId = route.params.id;
</script>
<template>
  <Breadcrumb :title="t('view-health-plan')" :items="breadcrumbHealthPlan" />
  <List :card-title="t('t-view-health-plan')" />
</template>
