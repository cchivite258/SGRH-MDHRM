<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/checkboxRadio/utils";
import CheckboxRadio from "@/components/forms/checkboxRadio/index.vue";
</script>
<template>
  <Breadcrumb title="Checkboxes & Radios" :items="breadcrumb" />
  <CheckboxRadio />
</template>
