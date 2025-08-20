<script lang="ts" setup>
import { breadcrumb } from "@/components/advanceUI/highlight/utils";
import Highlight from "@/components/advanceUI/highlight/index.vue";
</script>
<template>
  <Breadcrumb title="Highlight" :items="breadcrumb" />
  <Highlight />
</template>