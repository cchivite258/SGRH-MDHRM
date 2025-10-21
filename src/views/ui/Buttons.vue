<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/buttons/utils";
import Buttons from "@/components/ui/buttons/index.vue";
</script>
<template>
  <Breadcrumb title="Buttons" :items="breadcrumb" />
  <Buttons />
</template>
