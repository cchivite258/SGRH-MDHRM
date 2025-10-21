<script lang="ts" setup>
import { breadcrumb } from "@/components/icons/phosphor/utils";
import Phosphor from "@/components/icons/phosphor/index.vue";
</script>

<template>
  <Breadcrumb title="Phosphor" :items="breadcrumb" />
  <Phosphor />
</template>
