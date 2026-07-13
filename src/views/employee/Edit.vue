<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Create from "@/components/employee/create/index.vue";
import { useI18n } from "vue-i18n";
import { buildEmployeeBreadcrumb, buildEmployeeRoutePath } from "@/views/employee/breadcrumb";

const { t } = useI18n();
const route = useRoute();
const breadcrumb = computed(() => buildEmployeeBreadcrumb(route, "edit-employee", buildEmployeeRoutePath(route, "/employee/edit")));
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <Create :card-title="t('t-edit-employee')" />
</template>
