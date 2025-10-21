<script lang="ts" setup>
import { breadcrumb } from "@/components/realEstate/createProperty/utils";
import CreateProperties from "@/components/realEstate/createProperty/index.vue";
</script>
<template>
  <Breadcrumb title="Add Properties" :items="breadcrumb" />
  <CreateProperties />
</template>
