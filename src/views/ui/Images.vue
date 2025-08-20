<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/images/utils";
import Images from "@/components/ui/images/index.vue";
</script>
<template>
  <Breadcrumb title="Images" :items="breadcrumb" />
  <Images />
</template>
