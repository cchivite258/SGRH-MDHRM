<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/languages/listView/utils";
import ListView from "@/components/baseTables/languages/listView/index.vue";
</script>
<template>
  <Breadcrumb title="language-list" :items="breadcrumb" />
  <ListView />
</template>
