<script lang="ts" setup>
import { breadcrumbCoveragePeriodView } from "@/components/institution/create/utils";
import List from "@/components/institution/create/viewCoveragePeriod/listView/index.vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const coveragePeriodId = route.params.id;
</script>
<template>
  <Breadcrumb :title="t('view-coverage-period')" :items="breadcrumbCoveragePeriodView" />
  <List :card-title="t('t-view-coverage-period')" />
</template>
