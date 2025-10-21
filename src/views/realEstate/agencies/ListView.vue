<script lang="ts" setup>
import { breadcrumb } from "@/components/realEstate/agencies/listView/utils";
import ListView from "@/components/realEstate/agencies/listView/index.vue";
</script>
<template>
  <Breadcrumb title="List View" :items="breadcrumb" />
  <ListView />
</template>
