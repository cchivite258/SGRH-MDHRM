<script lang="ts" setup>
import { breadcrumb } from "@/components/users/modules/listView/utils";
import ListView from "@/components/users/modules/listView/index.vue";
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
