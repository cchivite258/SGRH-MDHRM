<script lang="ts" setup>
import { useRoute } from "vue-router";
import { breadcrumb } from "@/components/institution/create/utils";
import Edit from "@/components/institution/create/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const employeeId = route.params.id;
</script>

<template>
  <Breadcrumb :title="t('edit-institution')" :items="breadcrumb" />
  <Edit :card-title="t('t-edit-institution')" />
</template>