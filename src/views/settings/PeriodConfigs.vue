<script lang="ts" setup>
import { breadcrumb } from "@/components/settings/periodConfig/listView/utils";
import ListView from "@/components/settings/periodConfig/listView/index.vue";
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
