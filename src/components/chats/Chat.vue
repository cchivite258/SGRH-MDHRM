<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { DummyUser, MultiUser } from "@/assets/images/users/utils";
import {
  messages,
  chatOption,
  channelMessage,
  chatHeaderOptions
} from "@/components/chats/utils";

const props = defineProps({
  chatUser: Object
});

const emit = defineEmits(["onCloseChatUser"]);

const isChannel = computed(() => {
  return !!props.chatUser?.channel;
});
const query = ref("");
const messagesList = ref(isChannel.value ? channelMessage : messages);
const message = ref("");

watch(isChannel, (newVal: any) => {
  messagesList.value = newVal ? channelMessage : messages;
});

const activeUser = computed(() => {
  const { channel = {}, user = {} } = props.chatUser || {};
  return isChannel.value ? channel : user;
});

const userName = computed(() => {
  return activeUser.value?.name || "Lisa Parker";
});

const userProfile = computed(() => {
  let img;
  if (isChannel.value) {
    img = MultiUser;
  } else {
    img = activeUser.value?.src ? activeUser.value?.src : DummyUser;
  }
  return img;
});

const onSendMessage = () => {
  if (message.value === "") {
    return;
  }

  let lastMessenger: any = messages.find((message, index) => {
    return index === messages.length - 1;
  });

  if (lastMessenger) {
    const lastMsgIndex =
      lastMessenger.message[lastMessenger.message.length - 1].msg_id;

    if (lastMsgIndex) {
      const currentDate = new Date();
      const hours = currentDate.getHours();
      const timeFormate = hours >= 12 ? "pm" : "am";

      lastMessenger.message.push({
        msg_id: lastMsgIndex + 1,
        msg: message.value,
        createdAt: hours + ":" + currentDate.getMinutes() + " " + timeFormate
      });
    }
  }
  messagesList.value = messagesList.value.map((listItem) => {
    return {
      ...listItem,
      lastMessenger
    };
  });

  message.value = "";
  scrollToBottom();
};

const scrollToBottom = () => {
  const chatElement = document.querySelector(
    "#chat-conversation .simplebar-content-wrapper"
  );
  if (chatElement) {
    setTimeout(() => {
      chatElement.scrollTo({
        top: chatElement.scrollHeight + 200,
        behavior: "smooth"
      });
    }, 0);
  }
};

const emojiClick = (event: any) => {
  message.value = message.value + event.detail.unicode;
};
</script>
<template>
  <v-card class="h-100">
    <v-card-title>
      <v-row justify="space-between" class="flex-nowrap align-center">
        <v-col class="d-flex align-center py-4">
          <v-btn
            v-if="$vuetify.display.smAndDown"
            icon="ph-caret-left ph-sm"
            variant="text"
            color="primary"
            @click="$emit('onCloseChatUser')"
          />
          <v-badge
            dot
            location="bottom end"
            offset-x="3"
            offset-y="3"
            color="success"
            class="mx-2"
          >
            <v-avatar>
              <v-img :src="userProfile" size="x-small" />
            </v-avatar>
          </v-badge>
          <div class="d-flex flex-column">
            <h4 class="text-subtitle-1 font-weight-bold">{{ userName }}</h4>
            <span class="text-caption text-muted">Online</span>
          </div>
        </v-col>
        <v-col class="text-end">
          <v-menu :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn icon v-bind="props" color="secondary" variant="text">
                <i class="ph ph-magnifying-glass ph-lg"></i>
              </v-btn>
            </template>
            <div density="compact" style="width: 300px">
              <v-card border>
                <v-card-text class="pa-2">
                  <TextField
                    v-model="query"
                    variant="solo"
                    placeholder="Search here..."
                    single-line
                    hide-details
                    class="search-box"
                  >
                    <template #prepend-inner>
                      <i class="ph-magnifying-glass text-muted" />
                    </template>
                  </TextField>
                </v-card-text>
              </v-card>
            </div>
          </v-menu>

          <v-btn
            v-if="$vuetify.display.mdAndUp"
            icon
            color="secondary"
            variant="text"
          >
            <i class="ph ph-video-camera ph-lg"></i>
          </v-btn>
          <v-btn
            v-if="$vuetify.display.mdAndUp"
            icon
            color="secondary"
            variant="text"
          >
            <i class="ph ph-phone ph-lg"></i>
          </v-btn>
          <ListMenuWithIcon :menuItems="chatHeaderOptions" />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider :thickness="2" />
    <v-card-text>
      <div
        data-simplebar
        class="chat-conversation pa-3 pa-lg-4"
        id="chat-conversation"
      >
        <div v-for="(message, index) in messagesList" :key="'message-' + index">
          <v-row>
            <v-col
              cols="12"
              :class="message.align === 'right' ? 'justify-end' : ''"
              class="d-flex"
            >
              <div class="d-flex">
                <v-avatar v-if="message.align !== 'right'" color="light">
                  <v-img :src="userProfile" alt="userProfile" />
                </v-avatar>
                <div class="mx-3">
                  <div
                    v-for="(msg, i) in message.message"
                    :key="'user-chat-' + msg.msg_id"
                  >
                    <div
                      :class="{
                        'd-flex flex-row-reverse':
                          `${message.align}` === 'right',
                        'd-flex align-center': `${message.align}` !== 'right'
                      }"
                    >
                      <div
                        :class="{
                          'bg-primary': `${message.align}` === 'right',
                          'bg-light': `${message.align}` !== 'right',
                          'mt-4': i > 0
                        }"
                        class="px-3 py-3 rounded"
                      >
                        {{ msg.msg }}
                      </div>
                      <ListMenuWithIcon :menuItems="chatOption" />
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
      </div>
    </v-card-text>
    <v-divider :thickness="2" />
    <v-card-actions class="py-5">
      <v-row class="align-center">
        <v-col cols="auto">
          <v-menu location="top" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props">
                <i class="ph ph-smiley ph-lg"></i>
              </v-btn>
            </template>

            <v-card>
              <emoji-picker @emoji-click="emojiClick" />
            </v-card>
          </v-menu>
        </v-col>
        <v-col cols class="px-0">
          <TextField
            v-model="message"
            variant="solo"
            hide-details
            placeholder="Type your message..."
            class="rounded chat-message-input search-box"
            @keyup.enter="onSendMessage"
          />
        </v-col>
        <v-col cols="auto">
          <v-btn
            color="secondary"
            min-width="35"
            min-height="35"
            variant="elevated"
            @click="onSendMessage"
          >
            <v-icon> mdi-send </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>
