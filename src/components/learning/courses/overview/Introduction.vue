<script lang="ts" setup>
import { introOptions } from "@/components/learning/courses/overview/utils";
import Status from "@/app/common/components/Status.vue";
import { ref } from "vue";
const isBookmark = ref(true);
</script>
<template>
  <v-card class="position-relative w-100" elevation="0">
    <div class="w-100 position-relative" style="height: 500px">
      <iframe
        src="https://www.youtube.com/embed/Hu4Yvq-g7_Y"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        class="h-100 w-100"
      />
      <div class="overview-intro-btn">
        <v-btn class="me-2" to="/learning/create">
          <i class="ph-note-pencil" /> Edit Course</v-btn
        >
        <ListMenuWithIcon
          variant="elevated"
          density="comfortable"
          icon="ph-share-network"
          :menuItems="introOptions"
        />
      </div>
    </div>
    <v-card-text>
      <div class="d-flex justify-space-between mb-1">
        <h6 class="text-h6 font-weight-bold">
          Getting Started with JavaScript
        </h6>
        <v-btn
          icon
          density="compact"
          color="warning"
          rounded
          :variant="isBookmark ? 'elevated' : 'tonal'"
          @click="isBookmark = !isBookmark"
        >
          <i class="bx" :class="isBookmark ? ' bxs-star' : ' bx-star'" />
        </v-btn>
      </div>
      <div class="d-flex align-center">
        <i class="ph-codesandbox-logo me-1" />
        <span> React Development</span>
        <v-rating
          :model-value="4.5"
          readOnly
          density="compact"
          hide-details
          half-increments
          color="warning"
        />
        <span class="me-1"> 4.5 </span>
        <Status status="beginner" />
      </div>
    </v-card-text>
  </v-card>
</template>
