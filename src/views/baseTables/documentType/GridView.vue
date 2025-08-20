<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/documentType/gridView/utils";
import GridView from "@/components/baseTables/documentType/gridView/index.vue";
</script>
<template>
  <Breadcrumb title="Agent Grid" :items="breadcrumb" />
  <GridView />
</template>
