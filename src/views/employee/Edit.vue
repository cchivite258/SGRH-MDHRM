<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Create from "@/components/employee/create/index.vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const employeeId = route.params.id;

const breadcrumb = computed<BreadcrumbType[]>(() => [
  {
    title: "employee-list",
    disabled: false,
    to: "/employee/list"
  },
  {
    title: "edit-employee",
    disabled: true,
    to: typeof employeeId === "string" ? `/employee/edit/${employeeId}` : undefined
  }
]);
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <Create :card-title="t('t-edit-employee')" />
</template>
