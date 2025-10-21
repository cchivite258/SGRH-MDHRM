<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/formSelect/utils";
import FormSelect from "@/components/forms/formSelect/index.vue";
</script>
<template>
  <Breadcrumb title="Form Select" :items="breadcrumb" />
  <FormSelect />
</template>
