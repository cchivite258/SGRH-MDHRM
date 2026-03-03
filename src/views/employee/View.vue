<script lang="ts" setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import View from "@/components/employee/view/index.vue";
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
    title: "view-employee",
    disabled: true,
    to: typeof employeeId === "string" ? `/employee/view/${employeeId}` : undefined
  }
]);
</script>

<template>
  <Breadcrumb :title="t('view-employee')" :items="breadcrumb" />
  <View :card-title="t('t-view-employee')" />
</template>
