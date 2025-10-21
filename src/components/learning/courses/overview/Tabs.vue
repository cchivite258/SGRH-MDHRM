<script lang="ts" setup>
import { tabs } from "@/components/learning/courses/overview/utils";
import { ref } from "vue";
import OverviewTab from "@/components/learning/courses/overview/OverviewTab.vue";
import TutorialTab from "@/components/learning/courses/overview/TutorialTab.vue";
import RatingAndReview from "@/components/eCommerce/ProductDetails/RatingAndReview.vue";
import FaqsTab from "@/components/learning/courses/overview/FaqsTab.vue";
const tab = ref("description");
</script>
<template>
  <v-card elevation="0">
    <v-tabs v-model="tab" color="primary">
      <v-tab
        v-for="tab in tabs"
        :key="'learning-overview-tab-' + tab.value"
        :value="tab.value"
      >
        {{ tab.title }}
      </v-tab>
    </v-tabs>
  </v-card>

  <v-card elevation="0" class="mt-5">
    <v-window v-model="tab">
      <v-window-item value="description"><OverviewTab /></v-window-item>
      <v-window-item value="tutorial"> <TutorialTab /> </v-window-item>
      <v-window-item value="review"> <RatingAndReview /> </v-window-item>
      <v-window-item value="faqs"> <FaqsTab /> </v-window-item>
    </v-window>
  </v-card>
</template>
