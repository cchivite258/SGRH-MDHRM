<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/expansionPanel/utils";
import ExpansionPanels from "@/components/ui/expansionPanel/index.vue";
</script>
<template>
  <Breadcrumb title="Expansion Panels" :items="breadcrumb" />
  <ExpansionPanels />
</template>
