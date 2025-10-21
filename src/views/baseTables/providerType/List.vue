<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/providerType/listView/utils";
import ListView from "@/components/baseTables/providerType/listView/index.vue";
</script>
<template>
  <Breadcrumb title="provider-type-list" :items="breadcrumb" />
  <ListView />
</template>
