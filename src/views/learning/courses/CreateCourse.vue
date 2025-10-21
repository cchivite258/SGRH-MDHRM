<script lang="ts" setup>
import { createCourseBreadcrumb } from "@/components/learning/courses/createCourse/utils";
import CreateCourse from "@/components/learning/courses/createCourse/index.vue";
</script>
<template>
  <Breadcrumb title="Create Course" :items="createCourseBreadcrumb" />
  <CreateCourse />
</template>
