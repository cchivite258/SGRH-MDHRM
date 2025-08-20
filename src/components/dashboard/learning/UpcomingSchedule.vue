<script lang="ts" setup>
import { useLayoutStore } from "@/store/app";
const state = useLayoutStore();
const mode = state.mode;

const schedule = [
  {
    title: "UI/UX style guide with sketch",
    date: "Today",
    time: "02:18 PM",
  },
  {
    title: "Advanced React And Redux",
    date: "04 April, 2023",
    time: "03:00 to 04:00 PM",
  },
  {
    title: "Tailwind CSS From Scratch",
    date: "08 April, 2023",
    time: "07:36 AM",
  },
  {
    title: "REST APIs With Flask",
    date: "15 April, 2023",
    time: "10:11 PM",
  },
  {
    title: "Asp.Net Core 7 True Ultimate Guide",
    date: "24 May, 2023",
    time: "07:00 to 10:00 AM",
  },
];
</script>
<template>
  <v-container>
    <v-card
      v-for="(data, index) in schedule"
      :key="'schedule-' + index"
      class="mb-5"
    >
      <v-divider
        vertical
        thickness="4"
        color="primary"
        class="border-opacity-100 d-flex h-100"
        style="position: absolute"
      />
      <v-card-text>
        <v-row>
          <v-col cols>
            <div class="text-subtitle-2 font-weight-bold">
              {{ data.title }}
            </div>
            <div class="d-flex text-muted mt-2">
              <div class="d-flex align-center me-2">
                <i class="ph ph-calendar-blank me-2 ph-lg"></i>
                <span class="text-caption font-weight-regular">{{
                  data.date
                }}</span>
              </div>
              <div class="d-flex align-center">
                <i class="ph ph-clock me-2 ph-lg"></i>
                <span class="text-caption font-weight-regular">{{
                  data.time
                }}</span>
              </div>
            </div>
          </v-col>
          <v-col cols="auto" class="d-flex align-center">
            <v-btn
              color="primary"
              size="x-small"
              min-width="20"
              min-height="30"
              to="/apps-learning-overview"
            >
              <i class="ph-arrow-right"></i>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card color="primary">
      <div style="opacity: 0.15; position: absolute">
        <img src="@/assets/images/effect-pattern/pattern-2.svg" />
      </div>
      <v-card-text class="position-relative pb-0">
        <img
          src="@/assets/images/logo-light.png"
          alt=""
          height="22"
          class="mb-4"
        />
        <h6 class="text-subtitle-1 font-weight-medium">Go Premium</h6>
        <p class="mt-1 text-caption font-weight-regular">
          Explore 500+ courses with lifetime membership by themesbrand
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="plain" class="">
          Premium Now <i class="ph-arrow-right ms-1"></i>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
