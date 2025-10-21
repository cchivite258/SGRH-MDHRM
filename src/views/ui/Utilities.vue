<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/utilities/utils";
import Utilities from "@/components/ui/utilities/index.vue";
</script>
<template>
  <Breadcrumb title="Utilities" :items="breadcrumb" />
  <Utilities />
</template>
