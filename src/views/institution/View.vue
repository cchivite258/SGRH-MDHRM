<script lang="ts" setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import View from "@/components/institution/view/index.vue";
const route = useRoute();
const institutionId = route.params.id;

const breadcrumb = computed<BreadcrumbType[]>(() => [
  {
    title: "institution-list",
    disabled: false,
    to: "/institution/list"
  },
  {
    title: "view-institution",
    disabled: true,
    to:
      typeof institutionId === "string"
        ? `/institution/view/${institutionId}`
        : undefined
  }
]);
</script>

<template>
  <Breadcrumb title="view-institution" :items="breadcrumb" />
  <View />
</template>
