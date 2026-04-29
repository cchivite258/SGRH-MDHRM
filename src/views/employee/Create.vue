<script lang="ts" setup>
import Create from "@/components/employee/create/index.vue";
import { useI18n } from "vue-i18n";
import { breadcrumb } from "@/components/employee/create/utils";

const { t } = useI18n();
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <Create :card-title="t('t-add-employee')" />
</template>
