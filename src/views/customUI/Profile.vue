<script lang="ts" setup>
import { breadcrumb } from "@/components/customUI/profile/utils";
import Profile from "@/components/customUI/profile/index.vue";
</script>
<template>
  <Breadcrumb title="Profile" :items="breadcrumb" />
  <Profile />
</template>
