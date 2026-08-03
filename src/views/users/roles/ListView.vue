<script lang="ts" setup>
import { breadcrumb } from "@/components/users/roles/listView/utils";
import ListView from "@/components/users/roles/listView/index.vue";
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
