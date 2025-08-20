<script lang="ts" setup>
import { breadcrumb } from "@/components/ui/navigation-drawer/utils";
import NavigationDrawer from "@/components/ui/navigation-drawer/index.vue";
</script>
<template>
  <Breadcrumb title="Navigation Drawer" :items="breadcrumb" />
  <NavigationDrawer />
</template>
