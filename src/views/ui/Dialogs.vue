<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/dialogs/utils";
import Dialogs from "@/components/ui/dialogs/index.vue";
</script>
<template>
  <Breadcrumb title="Dialogs" :items="breadcrumb" />
  <Dialogs />
</template>
