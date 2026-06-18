<script lang="ts" setup>
import { breadcrumb } from "@/components/settings/alerts/listView/utils";
import ListView from "@/components/settings/alerts/listView/index.vue";
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
