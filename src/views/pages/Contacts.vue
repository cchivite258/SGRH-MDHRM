<script lang="ts" setup>
import { breadcrumb } from "@/components/pages/contacts/utils";
import Contacts from "@/components/pages/contacts/index.vue";
</script>
<template>
  <Breadcrumb title="Contacts" :items="breadcrumb" />
  <Contacts />
</template>
