<script lang="ts" setup>
import { ref } from "vue";
import ChatMenu from "@/components/chats/ChatMenu.vue";
import ChatList from "@/components/chats/ChatList.vue";
import Chat from "@/components/chats/Chat.vue";
import ContactList from "@/components/chats/ContactList.vue";
import { Avatar2 } from "@/assets/images/users/utils";
import Call from "@/components/chats/Call.vue";
import Bookmark from "@/components/chats/Bookmark.vue";
import Attachment from "@/components/chats/Attachment.vue";
import { watch } from "vue";
const menu = ref("chat");
const chatUser = ref({
  user: {
    id: 1,
    roomId: 1,
    name: "Lisa Parker",
    src: Avatar2,
    status: "success",
    online: true,
  },
  channel: 0,
});

const onMenuChange = (newMenu: string) => {
  menu.value = newMenu;
  chatUser.value.user = {
    id: 1,
    roomId: 1,
    name: "Lisa Parker",
    src: Avatar2,
    status: "success",
    online: true,
  };

  chatUser.value.channel = 0;
};

watch(chatUser, (newUser: any) => {
  if (newUser) {
    isChatUser.value = true;
  }
});

const onCloseChatUser = () => {
  isChatUser.value = false;
};

const isChatUser = ref(false);
</script>
<template>
  <v-row class="pa-4 d-flex flex-nowrap position-relative">
    <v-col cols="auto" class="px-0 d-none d-md-block">
      <ChatMenu v-model="menu" @onMenuChange="onMenuChange" />
    </v-col>
    <v-col cols="12" md="5" lg="3" xl="2" class="px-1">
      <ChatList v-if="menu === 'chat'" v-model="chatUser" />
      <ContactList v-else-if="menu === 'contact'" v-model="chatUser" />
      <Call v-else-if="menu === 'call'" />
      <Bookmark v-else-if="menu === 'bookmark'" />
      <Attachment v-else-if="menu === 'attachment'" />
    </v-col>
    <v-col cols="cols" class="px-0 d-none d-md-block">
      <Chat :chatUser="chatUser" />
    </v-col>
    <v-navigation-drawer
      v-if="$vuetify.display.smAndDown"
      v-model="isChatUser"
      class="d-md-none"
      location="right"
      width="500"
    >
      <v-card>
        <v-card-text>
          <Chat :chatUser="chatUser" @onCloseChatUser="onCloseChatUser" />
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
  </v-row>
</template>
