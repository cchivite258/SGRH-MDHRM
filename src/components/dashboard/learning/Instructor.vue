<script lang="ts">
import {
  Avatar2,
  Avatar7,
  Avatar4,
  Avatar5,
  Avatar6,
  Avatar1,
  Avatar8,
} from "@/assets/images/users/utils";

export default {
  data() {
    return {
      instructors: [
        {
          name: "Bethany Nienow",
          courses: 236,
          rating: 4.9,
          src: Avatar2,
        },
        {
          name: "Sonia Conn",
          courses: 247,
          rating: 4.8,
          src: Avatar7,
        },
        {
          name: "Talon Bradtke",
          courses: 365,
          rating: 4.9,
          src: Avatar4,
        },
        {
          name: "Tyrell Kerluke",
          courses: 298,
          rating: 4.7,
          src: Avatar5,
        },
        {
          name: "Ross Zieme",
          courses: 196,
          rating: 4.9,
          src: Avatar6,
        },
        {
          name: "Hollis Spencer",
          courses: 321,
          rating: 4.7,
          src: Avatar1,
        },
        {
          name: "Cordia Grady",
          courses: 357,
          rating: 4.8,
          src: Avatar8,
        },
      ],
    };
  },
};
</script>
<template>
  <Card title="Best instructors">
    <template #title-action>
      <v-btn color="primary" variant="text">
        View All <i class="ph-arrow-right ms-1"></i>
      </v-btn>
    </template>
    <v-card-text data-simplebar style="max-height: 345px">
      <v-row
        v-for="(instructor, index) in instructors"
        :key="'learning-instructor-' + index"
      >
        <v-col cols="auto">
          <v-avatar>
            <v-img :src="instructor.src" />
          </v-avatar>
        </v-col>
        <v-col cols class="ps-0">
          <div class="font-weight-bold">{{ instructor.name }}</div>
          <div class="text-muted">{{ instructor.courses }} Courses</div>
        </v-col>
        <v-col cols="auto">
          <v-chip color="warning" label size="x-small">
            <i class="bx bxs-star me-1"></i> {{ instructor.rating }}
          </v-chip>
        </v-col>
        <v-divider v-if="index !== instructors.length - 1" />
      </v-row>
    </v-card-text>
  </Card>
</template>
