<script lang="ts" setup>
import { breadcrumb } from "@/components/tickets/list/utils";
import ListView from "@/components/tickets/list/index.vue";
</script>
<template>
  <Breadcrumb title="List View" :items="breadcrumb" />
  <ListView />
</template>
