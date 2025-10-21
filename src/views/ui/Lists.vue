<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/lists/utils";
import Lists from "@/components/ui/lists/index.vue";
</script>
<template>
  <Breadcrumb title="Lists" :items="breadcrumb" />
  <Lists />
</template>
