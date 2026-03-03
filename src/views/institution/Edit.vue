<script lang="ts" setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import Edit from "@/components/institution/create/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const institutionId = route.params.id;

const breadcrumb = computed<BreadcrumbType[]>(() => [
  {
    title: "institution-list",
    disabled: false,
    to: "/institution/list"
  },
  {
    title: "edit-institution",
    disabled: true,
    to:
      typeof institutionId === "string"
        ? `/institution/edit/${institutionId}`
        : undefined
  }
]);
</script>

<template>
  <Breadcrumb :title="t('edit-institution')" :items="breadcrumb" />
  <Edit :card-title="t('t-edit-institution')" />
</template>
