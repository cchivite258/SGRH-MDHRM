<script lang="ts" setup>
import { breadcrumb } from "@/components/pages/profile/utils";
import Profile from "@/components/pages/profile/index.vue";
</script>
<template>
  <Breadcrumb title="Profile" :items="breadcrumb" />
  <Profile />
</template>
