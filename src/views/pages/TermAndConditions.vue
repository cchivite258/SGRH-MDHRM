<script lang="ts" setup>
import { breadcrumb } from "@/components/pages/termAndConditions/utils";
import TermConditions from "@/components/pages/termAndConditions/index.vue";
</script>
<template>
  <Breadcrumb title="Term & Conditions" :items="breadcrumb" />
  <TermConditions />
</template>
