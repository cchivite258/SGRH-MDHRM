<script lang="ts" setup>
import { breadcrumbHealthPlanView } from "@/components/institution/create/utils";
import List from "@/components/institution/create/viewHealthPlan/listView/index.vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const healthPlanId = route.params.id;
</script>
<template>
  <Breadcrumb :title="t('view-health-plan')" :items="breadcrumbHealthPlanView" />
  <List :card-title="t('t-view-health-plan')" />
</template>
