<script lang="ts" setup>
import { breadcrumb } from "@/components/icons/phosphor/utils";
import Google from "@/components/maps/google/index.vue";
</script>

<template>
  <Breadcrumb title="Google" :items="breadcrumb" />
  <Google />
</template>
