<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/validations/utils";
import Validations from "@/components/forms/validations/index.vue";
</script>
<template>
  <Breadcrumb title="Form Validations" :items="breadcrumb" />
  <Validations />
</template>
