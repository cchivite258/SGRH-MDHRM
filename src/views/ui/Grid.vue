<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/grid/utils";
import Grid from "@/components/ui/grid/index.vue";
</script>
<template>
  <Breadcrumb title="Grid" :items="breadcrumb" />
  <Grid />
</template>
