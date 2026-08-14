<script lang="ts" setup>
import { breadcrumb } from "@/components/settings/codeConfig/listView/utils";
import ListView from "@/components/settings/codeConfig/listView/index.vue";
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <ListView />
</template>
