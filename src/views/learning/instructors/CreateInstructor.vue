<script lang="ts" setup>
import { breadcrumb } from "@/components/learning/instructors/createInstructor/utils";
import CreateInstructor from "@/components/learning/instructors/createInstructor/index.vue";
</script>
<template>
  <Breadcrumb title="Create Instructor" :items="breadcrumb" />
  <CreateInstructor />
</template>
