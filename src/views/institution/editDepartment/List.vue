<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import List from "@/components/institution/create/editDepartment/listView/index.vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { departmentService } from "@/app/http/httpServiceProvider";

const { t } = useI18n();
const route = useRoute();
const departmentId = route.params.id;
const queryInstitutionId = computed(() => {
  const value = route.query.institutionId;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : null;
});
const institutionId = ref<string | null>(queryInstitutionId.value);

const breadcrumbDepartmet = computed<BreadcrumbType[]>(() => [
  {
    title: "institution-list",
    disabled: false,
    to: "/institution/list"
  },
  {
    title: "edit-institution",
    disabled: false,
    to: institutionId.value
      ? { path: `/institution/edit/${institutionId.value}`, query: { tab: "4" } }
      : undefined
  },
  {
    title: "edit-department",
    disabled: true
  }
]);

onMounted(async () => {
  if (queryInstitutionId.value) {
    institutionId.value = queryInstitutionId.value;
    return;
  }

  if (typeof departmentId !== "string") return;
  try {
    const response = await departmentService.getDepartmentsById(departmentId);
    const company = response.data?.company;
    institutionId.value = typeof company === "string" ? company : company?.id || null;
  } catch (error) {
    console.error("Erro ao obter instituição do departamento:", error);
  }
});
</script>
<template>
  <Breadcrumb :title="t('edit-department')" :items="breadcrumbDepartmet" />
  <List :card-title="t('t-edit-department')" />
</template>
