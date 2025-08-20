<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/embedVideo/utils";
import EmbedVideo from "@/components/ui/embedVideo/index.vue";
</script>
<template>
  <Breadcrumb title="Embed Video" :items="breadcrumb" />
  <EmbedVideo />
</template>
