<script lang="ts" setup>
import { ref } from "vue";
import {
  agentDetailsCardOption,
  agentDetails,
  messages,
} from "@/components/realEstate/agent/overview/utils";
import { Avatar1 } from "@/assets/images/users/utils";
import { socialMedias } from "@/components/realEstate/overview/utils";
import { chatBoxOption } from "@/components/email/utils";
const isBookmark = ref(false);
</script>
<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
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
      <ListMenuWithIcon variant="tonal" :menuItems="agentDetailsCardOption" />
    </v-card-title>
    <v-card-text class="mt-4">
      <div class="text-center">
        <v-avatar :image="Avatar1" rounded size="70" />
        <div class="text-subtitle-1 font-weight-bold mt-3">
          Jerry Emard <i class="bx bxs-badge-check text-info"></i>
        </div>
        <div class="text-muted mb-3">Agent</div>
      </div>
      <div class="mt-7">
        <v-row
          v-for="(item, index) in agentDetails"
          :key="'agent-detail-' + index"
          no-gutters
          class="mb-3"
        >
          <v-col cols="5" class="font-weight-bold"> {{ item.title }} </v-col>
          <v-col cols="7"> {{ item.value }} </v-col>
        </v-row>
      </div>
      <div class="text-center mt-4">
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
  <v-card elevation="0" class="mt-4">
    <v-card-title class="bg-primary-subtle">
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-subtitle-1 font-weight-bold text-primary">
            Jerry Emard
          </div>
          <div class="text-primary">Active</div>
        </div>
        <div>
          <v-btn
            icon="ph-phone"
            color="info"
            density="compact"
            variant="elevated"
            rounded
          />
        </div>
      </div>
    </v-card-title>
    <v-card-text class="pt-3" data-simplebar style="height: 300px">
      <div v-for="(message, index) in messages" :key="'message-' + index">
        <v-row>
          <v-col
            cols="12"
            :class="message.align === 'right' ? 'justify-end' : ''"
            class="d-flex"
          >
            <div class="d-flex">
              <v-avatar v-if="message.align !== 'right'" color="light">
                <v-img :src="Avatar1" alt="userProfile" />
              </v-avatar>
              <div class="mx-3">
                <div
                  v-for="(msg, i) in message.message"
                  :key="'user-chat-' + msg.msg_id"
                >
                  <div
                    :class="{
                      'd-flex flex-row-reverse': `${message.align}` === 'right',
                    }"
                    class="d-flex"
                  >
                    <span
                      :class="{
                        'bg-primary': `${message.align}` === 'right',
                        'bg-light': `${message.align}` !== 'right',
                        'mt-4': i > 0,
                      }"
                      class="px-3 py-3 rounded d-flex real-estate-msg"
                    >
                      {{ msg.msg }}
                    </span>
                    <ListMenuWithIcon :menuItems="chatBoxOption" />
                  </div>
                  <div
                    class="text-caption text-muted"
                    :class="message.align === 'right' ? 'text-right' : ''"
                  >
                    <i
                      v-if="message.align === 'right'"
                      class="bx bx-check-double text-success"
                    ></i>
                    {{ msg.createdAt }}
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <TextField
        placeholder="Enter Message"
        class="search-box w-100"
        variant="solo"
        hideDetails
      />
      <v-btn
        color="secondary"
        rounded
        size="small"
        elevation="0"
        class="ms-2"
        icon="ph-paper-plane-right"
        variant="elevated"
      />
    </v-card-actions>
  </v-card>
</template>
