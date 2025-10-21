<script lang="ts" setup>
import { breadcrumb } from "@/components/icons/boxicons/utils";
import Boxicons from "@/components/icons/boxicons/index.vue";
</script>

<template>
  <Breadcrumb title="Boxicons" :items="breadcrumb" />
  <Boxicons />
</template>
