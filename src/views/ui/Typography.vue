<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/typography/utils";
import Typography from "@/components/ui/typography/index.vue";
</script>
<template>
  <Breadcrumb title="Typography" :items="breadcrumb" />
  <Typography />
</template>
