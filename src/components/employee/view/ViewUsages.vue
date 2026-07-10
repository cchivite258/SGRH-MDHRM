<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import ViewHealthPlanUsages from "@/components/employee/shared/ViewHealthPlanUsages.vue";

const route = useRoute();

const isEmployee = computed(() => route.query.isEmployee !== "false");
const dependentId = computed(() => {
  const value = route.query.dependentId;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
});
</script>

<template>
  <ViewHealthPlanUsages
    back-route-base="/employee/view"
    :is-employee="isEmployee"
    :dependent-id="dependentId"
  />
</template>
