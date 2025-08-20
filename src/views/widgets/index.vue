<script lang="ts" setup>
import { breadcrumb } from "@/components/widgets/utils";
import Widgets from "@/components/widgets/index.vue";
</script>
<template>
  <Breadcrumb title="Widgets" :items="breadcrumb" />
  <Widgets />
</template>
