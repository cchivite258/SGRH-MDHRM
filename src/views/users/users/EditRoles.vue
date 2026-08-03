<script lang="ts" setup>
import EditRoles from "@/components/users/users/editRoles/index.vue";

const breadcrumb = [
  {
    title: "access-management",
    disabled: false,
    to: "/users/users/list",
  },
  {
    title: "users",
    disabled: false,
    to: "/users/users/list",
  },
  {
    title: "manage-user-roles",
    disabled: true,
  },
];
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <EditRoles />
</template>
