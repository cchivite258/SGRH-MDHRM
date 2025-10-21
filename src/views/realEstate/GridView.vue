<script lang="ts" setup>
import { breadcrumb } from "@/components/realEstate/grid/utils";
import GridView from "@/components/realEstate/grid/index.vue";
</script>
<template>
  <Breadcrumb title="Listing Grid" :items="breadcrumb" />
  <GridView />
</template>
