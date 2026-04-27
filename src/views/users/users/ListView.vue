<script lang="ts" setup>
import { breadcrumb } from "@/components/users/users/listView/utils";
import ListView from "@/components/users/users/listView/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
