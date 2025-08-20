<script lang="ts" setup>
import { breadcrumb } from "@/components/icons/remix/utils";
import Remix from "@/components/icons/remix/index.vue";
</script>

<template>
  <Breadcrumb title="Remix" :items="breadcrumb" />
  <Remix />
</template>
