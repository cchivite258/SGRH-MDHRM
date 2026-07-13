<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import ViewHealthPlanUsages from "@/components/employee/shared/ViewHealthPlanUsages.vue";

const route = useRoute();

const isEmployee = computed(() => route.query.isEmployee !== "false");
const dependentId = computed<string | undefined>(() => {
  const value = route.query.dependentId;
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
});
</script>

<template>
  <ViewHealthPlanUsages
    back-route-base="/employee/view"
    :is-employee="isEmployee"
    :dependent-id="dependentId"
  />
</template>
