<script lang="ts" setup>
import { breadcrumb } from "@/components/pages/faqs/utils";
import FAQs from "@/components/pages/faqs/index.vue";
</script>
<template>
  <Breadcrumb title="Faqs" :items="breadcrumb" />
  <FAQs />
</template>
