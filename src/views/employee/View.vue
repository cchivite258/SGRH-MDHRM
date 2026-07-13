<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import View from "@/components/employee/view/index.vue";
import { useI18n } from "vue-i18n";
import { buildEmployeeBreadcrumb, buildEmployeeRoutePath } from "@/views/employee/breadcrumb";

const { t } = useI18n();
const route = useRoute();
const breadcrumb = computed(() => buildEmployeeBreadcrumb(route, "view-employee", buildEmployeeRoutePath(route, "/employee/view")));
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <View :card-title="t('t-view-employee')" />
</template>
