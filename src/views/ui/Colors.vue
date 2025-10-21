<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/colors/utils";
import Colors from "@/components/ui/colors/index.vue";
</script>
<template>
  <Breadcrumb title="Colors" :items="breadcrumb" />
  <Colors />
</template>
