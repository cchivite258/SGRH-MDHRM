<script lang="ts" setup>
import { react } from "@/assets/images/learning/utils";
import { includedCourses } from "@/components/learning/courses/gridView/utils";
import { Avatar2 } from "@/assets/images/users/utils";
import ChatBox from "@/components/email/ChatBox.vue";
import { ref } from "vue";

const isChatBox = ref(false);
const chat = "Scott Median";
</script>
<template>
  <v-card elevation="0">
    <v-chip
      color="danger"
      variant="flat"
      rounded="sm"
      class="learning-overview-chip"
      >Off 20%</v-chip
    >
    <div
      class="text-center learning-widgets d-flex align-center justify-center bg-info-subtle"
    >
      <v-avatar size="80" rounded>
        <v-img :src="react" class="avatar-lg" />
      </v-avatar>
      <img :src="react" class="effect" />
    </div>
    <v-card-text>
      <div class="font-weight-bold">
        <span class="text-h6 font-weight-bold">$245.95</span>
        <span class="text-muted ms-1 text-decoration-line-through">499.99</span>
      </div>
      <div class="text-danger d-flex align-center">
        <i class="ph-clock me-1 ph-lg" /> <b class="me-1">10 </b> days left at
        this price
      </div>
    </v-card-text>
    <v-card-actions class="mx-3">
      <v-row no-gutters>
        <v-col cols="6">
          <v-btn variant="elevated" block color="secondary" class="me-1">
            Free trial
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn variant="elevated" block color="primary" class="ms-1">
            <i class="ph-bag me-1" /> Buy Now
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
  <Card title="This course includes" class="mt-4" elevation="0">
    <v-card-text>
      <div
        v-for="(include, index) in includedCourses"
        :key="'included-course-' + index"
        class="d-flex justify-space-between mb-2 align-center"
      >
        <div>
          <i :class="include.icon" class="text-primary me-1" />
          {{ include.title }}
        </div>
        <div class="text-muted">{{ include.value }}</div>
      </div>
    </v-card-text>
  </Card>
  <Card class="mt-4" title="Instructor Details" elevation="0">
    <template #title-action>
      <v-btn variant="text" color="primary" to="/instructors/overview">
        View More <i class="ph-arrow-right" />
      </v-btn>
    </template>
    <v-card-text>
      <div class="d-flex align-center">
        <v-avatar rounded size="45" class="me-2">
          <v-img :src="Avatar2" />
        </v-avatar>
        <div>
          <div class="text-subtitle-2">Morton Satterfield</div>
          <div class="text-muted">Software Engineering</div>
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="tonal" block color="info" @click="isChatBox = !isChatBox">
        <i class="ph-chat-circle-text me-1" /> Get In Touch
      </v-btn>
    </v-card-actions>
  </Card>

  <v-card class="bg-primary position-relative mt-5" elevation="0" :height="150">
    <v-img
      class="w-100 h-100"
      src="@/assets/images/effect-pattern/pattern.png"
      cover
    >
      <div class="pa-5">
        <div class="text-subtitle-1 font-weight-bold">Join Membership</div>
        <p class="">Access all course anywhere and any time</p>
        <v-btn variant="flat" class="mt-7" to="/pages/pricing">
          Join Now
        </v-btn>
      </div>
    </v-img>
  </v-card>

  <ChatBox v-if="isChatBox" :chat="chat" @onClose="isChatBox = !isChatBox" />
</template>
