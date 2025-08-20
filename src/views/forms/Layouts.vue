<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/layout/utils";
import FormLayout from "@/components/forms/layout/index.vue";
</script>
<template>
  <Breadcrumb title="Form Layout" :items="breadcrumb" />
  <FormLayout />
</template>
