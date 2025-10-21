<script lang="ts" setup>
import { breadcrumb } from "@/components/serviceProvider/list/utils";
import ServiceProviderList from "@/components/serviceProvider/list/index.vue";
</script>
<template>  
  <Breadcrumb title="service-provider-list" :items="breadcrumb" />
  <ServiceProviderList />
</template>
  
