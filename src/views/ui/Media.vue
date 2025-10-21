<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/media/utils";
import Media from "@/components/ui/media/index.vue";
</script>
<template>
  <Breadcrumb title="Media Object" :items="breadcrumb" />
  <Media />
</template>
