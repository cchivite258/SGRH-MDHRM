<script lang="ts" setup>
import { computed } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import Create from "@/components/institution/create/index.vue";

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
  <Breadcrumb title="add-institution" :items="breadcrumb" />
  <Create />
</template>
