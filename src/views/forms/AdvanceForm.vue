<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/advanceForm/utils";
import AdvanceForm from "@/components/forms/advanceForm/index.vue";
</script>
<template>
  <Breadcrumb title="Form Advanced" :items="breadcrumb" />
  <AdvanceForm />
</template>
