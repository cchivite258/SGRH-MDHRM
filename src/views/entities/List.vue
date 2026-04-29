<script lang="ts" setup>
import { breadcrumb } from "@/components/entities/list/utils";
import EntitiesList from "@/components/entities/list/index.vue";
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <EntitiesList />
</template>
