<script lang="ts" setup>
import {
  Avatar2,
  Avatar3,
  Avatar4,
  Avatar5,
  Avatar6
} from "@/assets/images/users/utils";
const rating = 5;
const feedbacks = [
  {
    src: Avatar2,
    name: "Josefa Weissnat",
    time: "04:47 PM",
    feedback: `" Themebrand used AnyDesk to fix the bug in Flask and django version. I highly recommend this product! "`
  },
  {
    src: Avatar3,
    name: "Ophelia Steuber",
    time: "11:24 AM",
    feedback: `" Thank you for this awesome admin panel. I'm very happy with it, it's a pleasure to work with it! "`
  },
  {
    src: Avatar4,
    name: "Dianna Bogan",
    time: "03:19 PM",
    feedback: `" High theme quality. Very good support, they spent almost an hour remotely to fix a problem. I hope this theme will have a long term support. "`
  },
  {
    src: Avatar5,
    name: "Jerry Emard",
    time: "06:39 AM",
    feedback: `" There is as lot packed in this template. The savings in time and energy is so worth it. "`
  },
  {
    src: Avatar6,
    name: "Axel Kozey",
    time: "09:18 AM",
    feedback: `" Works like a component library, a crazy amount of design elements already built and given. "`
  }
];
</script>
<template>
  <Card title="Customer Feedback" class="h-100">
    <template #title-action>
      <v-btn variant="text">
        View All <i class="ph-caret-right ms-1"></i>
      </v-btn>
    </template>
    <v-card-text data-simplebar style="max-height: 365px">
      <v-row
        v-for="(feedback, index) in feedbacks"
        :key="'real-estate-feedback-' + index"
      >
        <v-col cols="auto">
          <v-avatar rounded size="large">
            <v-img :src="feedback.src" />
          </v-avatar>
        </v-col>
        <v-col cols>
          <div class="d-flex justify-space-between">
            <div class="text-subtitle-2">{{ feedback.name }}</div>
            <div class="text-muted">{{ feedback.time }}</div>
          </div>
          <v-rating
            v-model="rating"
            readonly
            color="warning"
            size="x-small"
            density="comfortable"
          />
          <div class="text-muted">{{ feedback.feedback }}</div>
        </v-col>
        <v-divider v-if="index !== feedbacks.length - 1" />
      </v-row>
    </v-card-text>
  </Card>
</template>
