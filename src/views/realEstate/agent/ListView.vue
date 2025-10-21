<script lang="ts" setup>
import { breadcrumb } from "@/components/realEstate/agent/listView/utils";
import ListView from "@/components/realEstate/agent/listView/index.vue";
</script>
<template>
  <Breadcrumb title="Agent List" :items="breadcrumb" />
  <ListView />
</template>
