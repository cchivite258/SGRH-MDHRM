<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/editors/utils";
import Editors from "@/components/forms/editors/index.vue";
</script>
<template>
  <Breadcrumb title="Editors" :items="breadcrumb" />
  <Editors />
</template>
