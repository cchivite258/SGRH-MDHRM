<script lang="ts" setup>
import { Avatar1, Avatar2 } from "@/assets/images/users/utils";
import {
  socialMedias,
  ownerHistory,
} from "@/components/realEstate/overview/utils";
import { ref } from "vue";
import ChatBox from "@/components/email/ChatBox.vue";

const isChatBox = ref(false);
const chat = "Scott Median";
</script>
<template>
  <v-card elevation="0">
    <v-card-title class="bg-primary text-center">
      <div class="text-h6">$7000 - $8000</div>
      <div>Sale Price</div>
    </v-card-title>
  </v-card>
  <v-card elevation="0" class="mt-4">
    <v-card-text class="text-center pa-5">
      <v-avatar rounded size="70">
        <v-img :src="Avatar1" />
      </v-avatar>
      <div class="font-weight-bold text-subtitle-1 mt-3">Jerry Emard</div>
      <div class="text-muted text-uppercase mt-1">Owner</div>
      <div class="text-muted mt-3">
        73 Alum Rock Rd, Birmingham, West Midland, United Kingdom - s B8 1LY
      </div>
      <div class="mt-5">
        <v-avatar
          v-for="(item, index) in socialMedias"
          :key="'social-media-' + index"
          :color="item.color"
          variant="tonal"
          rounded
          size="small"
          class="mx-1"
        >
          <i :class="item.icon" />
        </v-avatar>
      </div>
    </v-card-text>
  </v-card>
  <Card title="Agent Details" class="mt-4" elevation="0">
    <template #title-action>
      <v-btn color="primary" variant="text">
        View More <i class="ph-arrow-right ms-1" />
      </v-btn>
    </template>
    <v-card-text>
      <div class="d-flex align-center">
        <v-avatar rounded size="45" class="me-2">
          <v-img :src="Avatar2" />
        </v-avatar>
        <div>
          <div class="text-subtitle-2">Morton Satterfield</div>
          <div class="text-muted">Agent</div>
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn
        variant="elevated"
        block
        color="secondary"
        @click="isChatBox = !isChatBox"
      >
        <i class="ph-chat-circle-text me-1" /> Get In Touch
      </v-btn>
    </v-card-actions>
  </Card>
  <Card title="Owner History" class="mt-4" elevation="0">
    <v-card-text>
      <div
        v-for="(item, index) in ownerHistory"
        :key="'owner-history-' + index"
      >
        <div class="d-flex justify-space-between py-3">
          <div class="d-flex">
            <v-avatar :image="item.img" />
            <div class="ms-3">
              <div class="font-weight-bold text-subtitle-2">
                {{ item.title }}
              </div>
              <div class="text-muted">{{ item.date }}</div>
            </div>
          </div>
          <div class="text-muted">
            <i class="bx bxs-star-half text-warning me-1"></i>{{ item.rating }}
          </div>
        </div>
        <v-divider v-if="index < ownerHistory.length - 1" />
      </div>
    </v-card-text>
  </Card>
  <ChatBox v-if="isChatBox" :chat="chat" @onClose="isChatBox = !isChatBox" />
</template>
