<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/general/utils";
import General from "@/components/ui/general/index.vue";
</script>
<template>
  <Breadcrumb title="General" :items="breadcrumb" />
  <General />
</template>
