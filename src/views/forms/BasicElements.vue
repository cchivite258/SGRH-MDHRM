<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/basicElements/utils";
import BasicElementForm from "@/components/forms/basicElements/index.vue";
</script>
<template>
  <Breadcrumb title="Basic Elements" :items="breadcrumb" />
  <BasicElementForm />
</template>
