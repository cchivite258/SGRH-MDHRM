<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import EditEntity from "@/components/entities/create/index.vue";

const route = useRoute();

const breadcrumb = computed<BreadcrumbType[]>(() => [
  {
    title: "entity-list",
    disabled: false,
    to: "/entities/list"
  },
  {
    title: "edit-entity",
    disabled: true,
    to: typeof route.params.id === "string" ? `/entities/edit/${route.params.id}` : undefined
  }
]);
</script>

<template>
  <Breadcrumb title="edit-entity" :items="breadcrumb" />
  <EditEntity />
</template>
