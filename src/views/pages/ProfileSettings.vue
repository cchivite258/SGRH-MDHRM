<script lang="ts" setup>
import { breadcrumb } from "@/components/pages/profileSettings/utils";
import ProfileSettings from "@/components/pages/profileSettings/index.vue";
</script>
<template>
  <Breadcrumb title="profile-settings" :items="breadcrumb" />
  <ProfileSettings />
</template>
