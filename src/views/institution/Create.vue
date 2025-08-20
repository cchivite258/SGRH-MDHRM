<script lang="ts" setup>
import { breadcrumb } from "@/components/institution/create/utils";
import Create from "@/components/institution/create/index.vue";
</script>
<template>
  <Breadcrumb title="add-institution" :items="breadcrumb" />
  <Create />
</template>
