<script lang="ts" setup>
import { computed } from "vue";
import Create from "@/components/institution/create/index.vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const breadcrumb = computed<BreadcrumbType[]>(() => [
  {
    title: "institution-list",
    disabled: false,
    to: "/institution/list"
  },
  {
    title: "add-institution",
    disabled: true
  }
]);
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <Create :card-title="t('t-add-institution')" />
</template>
