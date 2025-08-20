<script lang="ts" setup>
import { breadcrumb } from "@/components/advanceUI/scrollbar/utils";
import Scrollbar from "@/components/advanceUI/scrollbar/index.vue";
</script>
<template>
  <Breadcrumb title="ScrollBar" :items="breadcrumb" />
  <Scrollbar />
</template>