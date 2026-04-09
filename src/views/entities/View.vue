<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import ViewEntity from "@/components/entities/view/index.vue";

const route = useRoute();

const breadcrumb = computed<BreadcrumbType[]>(() => [
  {
    title: "entity-list",
    disabled: false,
    to: "/entities/list"
  },
  {
    title: "view-entity",
    disabled: true,
    to: typeof route.params.id === "string" ? `/entities/view/${route.params.id}` : undefined
  }
]);
</script>

<template>
  <Breadcrumb title="view-entity" :items="breadcrumb" />
  <ViewEntity />
</template>
