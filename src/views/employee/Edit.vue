<script lang="ts" setup>
import { useRoute } from "vue-router";
import { breadcrumb } from "@/components/employee/create/utils";
import Create from "@/components/employee/create/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const employeeId = route.params.id;
</script>

<template>
  <Breadcrumb :title="t('edit-employee')" :items="breadcrumb" />
  <Create :card-title="t('t-edit-employee')" />
</template>