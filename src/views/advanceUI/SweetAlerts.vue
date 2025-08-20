<script lang="ts" setup>
import { breadcrumb } from "@/components/advanceUI/sweetAlert/utils";
import SweetAlert from "@/components/advanceUI/sweetAlert/index.vue";
</script>
<template>
  <Breadcrumb title="Sweet Alerts" :items="breadcrumb" />
  <SweetAlert />
</template>