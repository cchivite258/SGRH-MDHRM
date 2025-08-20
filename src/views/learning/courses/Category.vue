<script lang="ts" setup>
import { categoryBreadcrumb } from "@/components/learning/courses/category/utils";
import Category from "@/components/learning/courses/category/index.vue";
</script>
<template>
  <Breadcrumb title="Category" :items="categoryBreadcrumb" />
  <Category />
</template>
