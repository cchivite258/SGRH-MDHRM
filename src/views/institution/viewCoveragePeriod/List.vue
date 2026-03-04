<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import List from "@/components/institution/create/viewCoveragePeriod/listView/index.vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { coveragePeriodsService } from "@/app/http/httpServiceProvider";

const { t } = useI18n();
const route = useRoute();
const coveragePeriodId = route.params.id;
const queryInstitutionId = computed(() => {
  const value = route.query.institutionId;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : null;
});
const institutionId = ref<string | null>(queryInstitutionId.value);

const breadcrumbCoveragePeriodView = computed<BreadcrumbType[]>(() => [
  {
    title: "institution-list",
    disabled: false,
    to: "/institution/list"
  },
  {
    title: "edit-institution",
    disabled: false,
    to: institutionId.value
      ? { path: `/institution/edit/${institutionId.value}`, query: { tab: "2" } }
      : undefined
  },
  {
    title: "view-coverage-period",
    disabled: true
  }
]);

onMounted(async () => {
  if (queryInstitutionId.value) {
    institutionId.value = queryInstitutionId.value;
    return;
  }

  if (typeof coveragePeriodId !== "string") return;
  try {
    const response = await coveragePeriodsService.getCoveragePeriodById(coveragePeriodId);
    const company = response.data?.company;
    institutionId.value = typeof company === "string" ? company : company?.id || null;
  } catch (error) {
    console.error("Erro ao obter instituição do período de cobertura:", error);
  }
});
</script>
<template>
  <Breadcrumb :title="t('view-coverage-period')" :items="breadcrumbCoveragePeriodView" />
  <List :card-title="t('t-view-coverage-period')" />
</template>
