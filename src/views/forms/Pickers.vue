<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/pickers/utils";
import Pickers from "@/components/forms/pickers/index.vue";
</script>
<template>
  <Breadcrumb title="Pickers" :items="breadcrumb" />
  <Pickers />
</template>
