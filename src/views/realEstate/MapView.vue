<script lang="ts" setup>
import { breadcrumb } from "@/components/realEstate/map/utils";
import MapView from "@/components/realEstate/map/index.vue";
</script>
<template>
  <Breadcrumb title="Listing Map" :items="breadcrumb" />
  <MapView />
</template>
