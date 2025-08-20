<script lang="ts" setup>
import { breadcrumb } from "@/components/pages/privacyPolicy/utils";
import PrivacyPolicy from "@/components/pages/privacyPolicy/index.vue";
</script>
<template>
  <Breadcrumb title="Privacy Policy" :items="breadcrumb" />
  <PrivacyPolicy />
</template>
