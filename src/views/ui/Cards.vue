<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/cards/utils";
import Cards from "@/components/ui/cards/index.vue";
</script>
<template>
  <Breadcrumb title="Cards" :items="breadcrumb" />
  <Cards />
</template>
