<script lang="ts" setup>
import { Img1 } from "@/assets/images/learning/utils";
import { Avatar2 } from "@/assets/images/users/utils";
import { ref } from "vue";

const languages = ["English", "Russian", "Chinese"];
const skills = [
  "UI/UX Design",
  "Shopify Development",
  "Social Ads Management",
  "Content SEO",
];
const isConnect = ref(false);
</script>
<template>
  <v-card>
    <div class="profile-wrapper">
      <div class="profile-over-layer bg-primary" />
      <v-img height="180" :src="Img1" cover />
      <v-btn color="secondary" class="instructor-profile-cover-btn">
        <i class="ph-pencil me-1" />
        Edit Profile</v-btn
      >
    </div>
    <v-card-text class="position-relative">
      <v-avatar class="instructor-profile-avatar" size="90">
        <v-img :src="Avatar2" />
      </v-avatar>
      <div class="mt-10 text-subtitle-1 font-weight-bold">
        Ayaan Bowen <v-badge dot inline color="success" />
      </div>
      <v-row justify="space-between">
        <v-col cols="12" lg="4">
          <div class="d-flex mb-3 text-muted align-center">
            <div class="d-flex align-center me-3">
              <i class="me-1 ph-map-pin"></i> Phoenix, USA
            </div>
            <div class="d-flex align-center me-3">
              <i class="me-1 ph ph-chalkboard"></i> 231 Courses
            </div>
            <div class="d-flex align-center me-3">
              <i class="me-1 ph ph-student"></i> 874 Students
            </div>
          </div>
          <p class="mb-2">Shopify Developer</p>
          <p class="text-muted mb-3">
            Shopify developers are experts in building online stores, themes and
            apps using the shopify platform.
          </p>
          <div class="d-flex align-center">
            <i class="ph ph-graduation-cap me-2" />
            Master of Engineering in California State University System
          </div>
          <div class="mt-4">
            <v-btn color="primary" @click="isConnect = !isConnect">
              <i v-if="isConnect" class="ph-check ph-lg" />
              <i v-else class="ph-user-square ph-lg" />
              <span class="ms-1">
                {{ isConnect ? "Disconnect" : "Connect" }}
              </span>
            </v-btn>
            <v-hover>
              <template v-slot:default="{ isHovering, props }">
                <v-btn
                  v-bind="props"
                  class="px-0 mx-2"
                  color="secondary"
                  icon="ph-chat-text"
                  :variant="isHovering ? 'elevated' : 'tonal'"
                  rounded
                  density="comfortable"
                />
              </template>
            </v-hover>
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  color="info"
                  variant="tonal"
                  icon="ph-dots-three-vertical ph-lg"
                  rounded
                  density="comfortable"
                />
              </template>
              <v-list density="compact" :lines="false">
                <v-list-item @click=""> Action </v-list-item>
                <v-list-item @click=""> Another Action </v-list-item>
                <v-list-item @click=""> Something else here </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </v-col>
        <v-col cols="12" lg="3">
          <p class="text-muted font-weight-medium mb-2">Language Knows</p>

          <v-chip
            v-for="language in languages"
            :key="language"
            color="info"
            variant="tonal"
            label
            class="ma-1"
            density="compact"
          >
            <span class="status-chip">{{ language }}</span>
          </v-chip>

          <p class="text-muted font-weight-medium mb-2 mt-4">Featured Skills</p>
          <v-chip
            v-for="skill in skills"
            :key="skill"
            color="secondary"
            variant="tonal"
            label
            class="ma-1"
            density="compact"
          >
            <span class="status-chip">{{ skill }}</span>
          </v-chip>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
