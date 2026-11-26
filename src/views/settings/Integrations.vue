<script lang="ts" setup>
import { breadcrumb } from "@/components/settings/integration/listView/utils";
import ListView from "@/components/settings/integration/listView/index.vue";
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
