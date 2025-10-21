<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/carousel/utils";
import Cards from "@/components/ui/carousel/index.vue";
</script>
<template>
  <Breadcrumb title="Carousel" :items="breadcrumb" />
  <Cards />
</template>
