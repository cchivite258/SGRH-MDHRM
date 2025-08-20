<script lang="ts" setup>
import { computed } from "vue";
import { emailChats, chatBoxOption } from "@/components/email/utils";
import { Avatar2 } from "@/assets/images/users/utils";

const prop = defineProps({
  chat: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["onClose"]);

const userProfile = computed(() => {
  const chat = emailChats.find((chat) => chat.name === prop.chat);
  return chat?.src || Avatar2;
});

const onClose = () => {
  emit("onClose");
};
</script>
<template>
  <v-card width="350" class="email-chat-detail">
    <v-card-title class="bg-primary d-flex justify-space-between align-center">
      <div>
        <div class="text-subtitle-2 font-weight-bold mt-2">{{ chat }}</div>
        <div>Active</div>
      </div>
      <v-btn icon="ph-x" variant="tonal" size="small" @click="onClose" />
    </v-card-title>
    <v-card-text class="pt-3">
      <v-row>
        <v-col cols="10" class="d-flex">
          <div class="d-flex">
            <v-avatar color="light" size="small">
              <v-img :src="userProfile" alt="userProfile" />
            </v-avatar>
            <div class="mx-3">
              <div>
                <div class="bg-light pa-3 rounded">
                  <p>
                    Yeah everything is fine. Our next meeting tomorrow at 10.00
                    AM
                  </p>
                </div>
                <div class="text-caption text-muted mt-2">09:10 am</div>
              </div>
            </div>
            <ListMenuWithIcon isIcon :menuItems="chatBoxOption" />
          </div>
        </v-col>
      </v-row>
      <v-row justify="end">
        <v-col cols="10" class="d-flex justify-end">
          <ListMenuWithIcon isIcon :menuItems="chatBoxOption" />

          <div>
            <div class="bg-primary rounded pa-3">Wow that's great</div>
            <div class="text-caption text-muted mt-2 text-end">
              <i class="bx bx-check-double text-success"></i>
              09:12 am
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-row no-gutters>
        <v-col cols>
          <TextField
            placeholder="Enter Message..."
            class="search-box"
            variant="solo"
            hideDetails
          />
        </v-col>
        <v-col cols="auto">
          <v-btn
            color="secondary"
            rounded
            size="small"
            elevation="0"
            class="mx-1"
            icon="ph-paper-plane-right"
            variant="elevated"
          />
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>
