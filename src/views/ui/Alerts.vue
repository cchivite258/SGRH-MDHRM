<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/alerts/utils";
import Alerts from "@/components/ui/alerts/index.vue";
</script>
<template>
  <Breadcrumb title="Alerts" :items="breadcrumb" />
  <Alerts />
</template>
