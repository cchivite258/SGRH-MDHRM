<script lang="ts" setup>
import { breadcrumb } from "@/components/institution/list/utils";
import InstitutionList from "@/components/institution/list/index.vue";
</script>
<template>
  <Breadcrumb title="institution-list" :items="breadcrumb" />
  <InstitutionList />
</template>
