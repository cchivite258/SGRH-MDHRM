<script lang="ts" setup>
import { tutorials } from "@/components/learning/courses/overview/utils";
import { ref } from "vue";
const tab = ref(0);
</script>
<template>
  <v-card-text>
    <v-expansion-panels v-model="tab" :multiple="false">
      <v-expansion-panel
        v-for="(tutorial, index) in tutorials"
        :key="'tutorial-' + tutorial.value"
        elevation="0"
        class="simple-border mb-3"
      >
        <v-expansion-panel-title
          :class="tab === index ? 'text-primary bg-primary-subtle' : ''"
        >
          <span class="font-weight-bold">{{ tutorial.title }}</span>
          <span class="ms-1"> ({{ tutorial.lessons }} lessons) </span>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card
            v-for="(video, i) in tutorial.videos"
            :key="'tutorial-video-' + i + '-' + index"
            border
            elevation="0"
            :class="video.isPlaying ? 'bg-primary' : ''"
          >
            <v-card-text class="d-flex justify-space-between align-center">
              <div>
                <v-avatar
                  v-if="video.isPlaying"
                  color="primary"
                  density="compact"
                  variant="tonal"
                  rounded
                  class="me-2 bg-light text-primary"
                >
                  <i class="ph-pause" />
                </v-avatar>
                <v-avatar
                  v-else
                  color="danger"
                  density="compact"
                  variant="tonal"
                  rounded
                  class="me-2"
                >
                  <i class="ph-play" />
                </v-avatar>
                <span>{{ video.name }}</span>
              </div>
              <div>{{ video.time }}</div>
            </v-card-text>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card-text>
</template>
