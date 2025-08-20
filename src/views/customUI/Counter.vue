<script lang="ts" setup>
import { breadcrumb } from "@/components/customUI/counter/utils";
import Counter from "@/components/customUI/counter/index.vue";
</script>
<template>
  <Breadcrumb title="Counter" :items="breadcrumb" />
  <Counter />
</template>
