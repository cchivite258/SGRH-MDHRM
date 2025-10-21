<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/country/editCountry/listView/utils";
import ListView from "@/components/baseTables/country/editCountry/listView/index.vue";
</script>
<template>
  <Breadcrumb title="edit-country" :items="breadcrumb" />
  <ListView />
</template>
