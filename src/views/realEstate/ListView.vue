<script lang="ts" setup>
import { breadcrumb } from "@/components/realEstate/list/utils";
import Listing from "@/components/realEstate/list/index.vue";
</script>
<template>
  <Breadcrumb title="Listing List" :items="breadcrumb" />
  <Listing />
</template>
