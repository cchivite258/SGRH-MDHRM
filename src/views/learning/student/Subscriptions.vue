<script lang="ts" setup>
import { subscriptionBreadcrumb } from "@/components/learning/students/subscription/utils";
import Subscription from "@/components/learning/students/subscription/index.vue";
</script>
<template>
  <Breadcrumb title="My Subscriptions" :items="subscriptionBreadcrumb" />
  <Subscription />
</template>
