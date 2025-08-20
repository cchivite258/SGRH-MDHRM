<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/inputMasks/utils";
import InputMasks from "@/components/forms/inputMasks/index.vue";
</script>
<template>
  <Breadcrumb title="Input Masks" :items="breadcrumb" />
  <InputMasks />
</template>
