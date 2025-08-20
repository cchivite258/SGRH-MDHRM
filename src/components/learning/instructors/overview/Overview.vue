<script lang="ts" setup>
import { ref } from "vue";
import { tabs } from "@/components/learning/instructors/overview/utils";
import CoursesList from "@/components/learning/instructors/overview/CoursesList.vue";
import Students from "@/components/learning/instructors/overview/Students.vue";
import RatingAndReview from "@/components/eCommerce/ProductDetails/RatingAndReview.vue";

const tab = ref("course");
</script>
<template>
  <Card title="Portfolio Overview">
    <template #title-action>
      <v-tabs v-model="tab" color="primary" align-tabs="center" hide-slider>
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          density="comfortable"
          variant="elevated"
          rounded
          :value="tab.value"
        >
          {{ tab.title }}
        </v-tab>
      </v-tabs>
    </template>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="course">
          <CoursesList />
        </v-window-item>
        <v-window-item value="students">
          <Students />
        </v-window-item>
        <v-window-item value="reviews">
          <RatingAndReview />
        </v-window-item>
      </v-window>
    </v-card-text>
  </Card>
</template>
