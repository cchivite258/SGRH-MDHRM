<script lang="ts" setup>
import { breadcrumbDepartmet } from "@/components/institution/create/utils";
import List from "@/components/institution/create/editCoveragePeriod/listView/index.vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const coveragePeriodId = route.params.id;
</script>
<template>
  <Breadcrumb :title="t('edit-coverage-period')" :items="breadcrumbDepartmet" />
  <List :card-title="t('t-edit-coverage-period')" />
</template>
