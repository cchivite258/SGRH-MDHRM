<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/tabs/utils";
import Tabs from "@/components/ui/tabs/index.vue";
</script>
<template>
  <Breadcrumb title="Tabs" :items="breadcrumb" />
  <Tabs />
</template>
