<script lang="ts" setup>
import { breadcrumbHealthPlan } from "@/components/institution/create/utils";
import List from "@/components/institution/create/editHealthPlan/listView/index.vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const healthPlanId = route.params.id;
</script>
<template>
  <Breadcrumb :title="t('edit-health-plan')" :items="breadcrumbHealthPlan" />
  <List :card-title="t('t-edit-health-plan')" />
</template>
