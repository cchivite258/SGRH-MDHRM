<script lang="ts" setup>
import { breadcrumb } from "@/components/clinics/list/utils";
import ClinicList from "@/components/clinics/list/index.vue";
</script>
<template>
  <Breadcrumb title="clinic-list" :items="breadcrumb" />
  <ClinicList />
</template>
