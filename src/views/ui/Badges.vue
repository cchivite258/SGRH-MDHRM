<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/badges/utils";
import Badges from "@/components/ui/badges/index.vue";
</script>
<template>
  <Breadcrumb title="Badges" :items="breadcrumb" />
  <Badges />
</template>
