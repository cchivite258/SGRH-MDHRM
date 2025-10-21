<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/documentType/listView/utils";
import ListView from "@/components/baseTables/documentType/listView/index.vue";
</script>
<template>
  <Breadcrumb title="document-type-list" :items="breadcrumb" />
  <ListView />
</template>
