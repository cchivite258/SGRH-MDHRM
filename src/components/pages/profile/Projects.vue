<script lang="ts" setup>
import { projects, cardOptions } from "@/components/pages/profile/utils";
import Pagination from "@/app/common/components/Pagination.vue";
import { ref } from "vue";
const page = ref(1);
</script>
<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
      lg="4"
      v-for="(item, index) in projects"
      :key="'project-' + index"
    >
      <v-card elevation="0">
        <v-card-title>
          <v-row justify="space-between">
            <v-col cols="auto">
              <v-chip :color="item.tagColor" label density="compact">
                <span class="font-weight-bold">{{ item.tag }}</span>
              </v-chip>
            </v-col>
            <v-col cols="auto">
              <ListMenuWithIcon :menuItems="cardOptions" />
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <div class="font-weight-bold text-subtitle-2">{{ item.title }}</div>
          <div class="text-muted mt-1">
            Last Update: <b> {{ item.lastUpdate }} </b>
          </div>
          <div class="font-weight-bold mt-4 d-flex justify-space-between">
            <span>Inprogress</span>
            <span :class="'text-' + item.progressColor">
              {{ item.progress }}%
            </span>
          </div>
          <v-progress-linear
            :model-value="item.progress"
            :color="item.progressColor"
            :height="5"
            rounded
            class="mt-1"
          />
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between mx-4">
          <div>
            <v-avatar
              v-for="avatar in item.avatars"
              size="30"
              class="avatar-group-item curser-pointer bg-light"
            >
              <v-img v-if="avatar.src" :src="avatar.src" />
              <span v-else class="text-primary font-weight-bold">
                {{ avatar }}
              </span>
            </v-avatar>
          </div>
          <div class="text-muted">
            <span class="me-4">
              <i class="ph-paperclip ph-lg" /> {{ item.share }}</span
            >
            <span> <i class="ph-chat-dots ph-lg" /> {{ item.chat }}</span>
          </div>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
  <div>
    <Pagination v-model="page" />
  </div>
</template>
