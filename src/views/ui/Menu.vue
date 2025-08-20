<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/menu/utils";
import Menu from "@/components/ui/menu/index.vue";
</script>
<template>
  <Breadcrumb title="Menu" :items="breadcrumb" />
  <Menu />
</template>
