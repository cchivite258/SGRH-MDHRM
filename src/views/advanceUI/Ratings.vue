<script lang="ts" setup>
import { breadcrumb } from "@/components/advanceUI/ratings/utils";
import Ratings from "@/components/advanceUI/ratings/index.vue";
</script>
<template>
  <Breadcrumb title="Ratings" :items="breadcrumb" />
  <Ratings />
</template>