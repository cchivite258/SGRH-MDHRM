<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/wizard/utils";
import Wizards from "@/components/forms/wizard/index.vue";
</script>
<template>
  <Breadcrumb title="Wizard" :items="breadcrumb" />
  <Wizards />
</template>
