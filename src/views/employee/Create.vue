<script lang="ts" setup>
import { breadcrumb } from "@/components/employee/create/utils";
import Create from "@/components/employee/create/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <Breadcrumb :title="t('add-employee')" :items="breadcrumb" />
  <Create :card-title="t('t-add-employee')" />
</template>