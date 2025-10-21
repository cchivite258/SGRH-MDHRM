<script lang="ts" setup>
import { breadcrumb } from "@/components/pages/timeline/utils";
import Timeline from "@/components/pages/timeline/index.vue";
</script>
<template>
  <Breadcrumb title="Timeline" :items="breadcrumb" />
  <Timeline />
</template>
