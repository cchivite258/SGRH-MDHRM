<script lang="ts" setup>
import { breadcrumb } from "@/components/institution/list/utils";
import InstitutionList from "@/components/institution/list/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <InstitutionList />
</template>
