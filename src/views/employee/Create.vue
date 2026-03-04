<script lang="ts" setup>
import { computed } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import Create from "@/components/employee/create/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const breadcrumb = computed<BreadcrumbType[]>(() => [
  {
    title: "employee-list",
    disabled: false,
    to: "/employee/list"
  },
  {
    title: "add-employee",
    disabled: true
  }
]);
</script>

<template>
  <Breadcrumb :title="t('add-employee')" :items="breadcrumb" />
  <Create :card-title="t('t-add-employee')" />
</template>
