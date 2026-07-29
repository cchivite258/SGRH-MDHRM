<script lang="ts" setup>
import EditPermissions from "@/components/users/roles/editPermissions/index.vue";

const breadcrumb = [
  {
    title: "access-management",
    disabled: false,
    to: "/users/roles/list",
  },
  {
    title: "roles",
    disabled: false,
    to: "/users/roles/list",
  },
  {
    title: "edit-role-permissions",
    disabled: true,
  },
];
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <EditPermissions />
</template>
