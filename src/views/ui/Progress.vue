<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/progress/utils";
import Progress from "@/components/ui/progress/index.vue";
</script>
<template>
  <Breadcrumb title="Progress" :items="breadcrumb" />
  <Progress />
</template>
