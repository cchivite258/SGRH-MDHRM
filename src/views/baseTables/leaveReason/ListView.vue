<script lang="ts" setup>
import { breadcrumb } from "@/components/baseTables/leaveReason/listView/utils";
import ListView from "@/components/baseTables/leaveReason/listView/index.vue";
</script>
<template>
  <Breadcrumb title="leave-reason-list" :items="breadcrumb" />
  <ListView />
</template>
