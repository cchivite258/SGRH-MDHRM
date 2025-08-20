<script lang="ts" setup>
import { useRoute } from "vue-router";
import { breadcrumb } from "@/components/employee/view/utils";
import View from "@/components/employee/view/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const employeeId = route.params.id;
</script>

<template>
  <Breadcrumb :title="t('view-employee')" :items="breadcrumb" />
  <View :card-title="t('t-view-employee')" />
</template>