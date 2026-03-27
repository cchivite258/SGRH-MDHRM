<script lang="ts" setup>
import { computed } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import CreateEntity from "@/components/entities/create/index.vue";

const breadcrumb = computed<BreadcrumbType[]>(() => [
  {
    title: "entity-list",
    disabled: false,
    to: "/entities/list"
  },
  {
    title: "add-entity",
    disabled: true
  }
]);
</script>

<template>
  <Breadcrumb title="add-entity" :items="breadcrumb" />
  <CreateEntity />
</template>
