<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Create from "@/components/employee/create/index.vue";
import { useI18n } from "vue-i18n";
import { buildEmployeeBreadcrumb } from "@/views/employee/breadcrumb";

const { t } = useI18n();
const route = useRoute();
const breadcrumb = computed(() => buildEmployeeBreadcrumb(route, "add-employee", "/employee/create"));
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <Create :card-title="t('t-add-employee')" />
</template>
