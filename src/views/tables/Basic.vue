<script lang="ts" setup>
import { breadcrumb } from "@/components/tables/basic/utils";
import BasicTable from "@/components/tables/basic/index.vue";
</script>
<template>
  <Breadcrumb title="Basic Tables" :items="breadcrumb" />
  <BasicTable />
</template>
