<script lang="ts" setup>
import { breadcrumb } from "@/components/learning/instructors/overview/utils";
import Overview from "@/components/learning/instructors/overview/index.vue";
</script>
<template>
  <Breadcrumb title="Overview" :items="breadcrumb" />
  <Overview />
</template>
