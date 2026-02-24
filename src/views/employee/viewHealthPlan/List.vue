<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import List from "@/components/employee/create/ViewUsages.vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { healthPlanEmployeeService } from "@/app/http/httpServiceProvider";

const { t } = useI18n();
const route = useRoute();
const healthPlanId = route.params.id;
const queryEmployeeId = computed(() => {
  const value = route.query.employeeId;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : null;
});
const employeeId = ref<string | null>(queryEmployeeId.value);

const breadcrumbHealthPlan = computed<BreadcrumbType[]>(() => [
  {
    title: "employee-list",
    disabled: false,
    to: "/employee/list"
  },
  {
    title: "edit-employee",
    disabled: false,
    to: employeeId.value
      ? { path: `/employee/edit/${employeeId.value}`, query: { tab: "4" } }
      : undefined
  },
  {
    title: "view-health-plan",
    disabled: true
  }
]);

onMounted(async () => {
  if (queryEmployeeId.value) {
    employeeId.value = queryEmployeeId.value;
    return;
  }

  if (typeof healthPlanId !== "string") return;
  try {
    const response = await healthPlanEmployeeService.getHealthPlanbyId(healthPlanId);
    employeeId.value = response.content?.employeeId || null;
  } catch (error) {
    console.error("Erro ao obter colaborador do plano de saúde:", error);
  }
});
</script>
<template>
  <Breadcrumb :title="t('view-health-plan')" :items="breadcrumbHealthPlan" />
  <List :card-title="t('t-view-health-plan')" />
</template>
