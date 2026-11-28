<script lang="ts" setup>
import { breadcrumb } from "@/components/settings/integrationSourceCode/listView/utils";
import ListView from "@/components/settings/integrationSourceCode/listView/index.vue";
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
