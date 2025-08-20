<script lang="ts" setup>
import PersonalInformation from "@/components/learning/instructors/createInstructor/PersonalInformation.vue";
import MediaProfile from "@/components/learning/instructors/createInstructor/MediaProfile.vue";
import EducationDetails from "@/components/learning/instructors/createInstructor/EducationDetails.vue";
</script>
<template>
  <PersonalInformation />
  <MediaProfile class="mt-4" />
  <EducationDetails class="mt-4" />
  <div class="d-flex justify-end mt-4">
    <v-btn color="secondary">
      <i class="ph-plus-circle me-1" /> Add Instructor
    </v-btn>
  </div>
</template>
