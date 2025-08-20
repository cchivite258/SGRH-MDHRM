<script lang="ts" setup>
import { courseBreadcrumb } from "@/components/learning/students/courses/utils";
import Courses from "@/components/learning/students/courses/index.vue";
</script>
<template>
  <Breadcrumb title="My Courses" :items="courseBreadcrumb" />
  <Courses />
</template>
