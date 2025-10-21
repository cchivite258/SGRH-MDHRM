<script lang="ts" setup>
import { breadcrumb } from "@/components/realEstate/agent/gridView/utils";
import GridView from "@/components/realEstate/agent/gridView/index.vue";
</script>
<template>
  <Breadcrumb title="Agent Grid" :items="breadcrumb" />
  <GridView />
</template>
