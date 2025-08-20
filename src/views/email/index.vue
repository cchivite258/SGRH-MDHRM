<script lang="ts" setup>
import { ref, computed } from "vue";
import EmailMenu from "@/components/email/EmailMenu.vue";
import ComposeCard from "@/components/email/ComposeCard.vue";
import ComposeDialog from "@/components/email/ComposeDialog.vue";
import EmailList from "@/components/email/EmailList.vue";
import EmailDetail from "@/components/email/EmailDetail.vue";
import ChatBox from "@/components/email/ChatBox.vue";
import { ActiveMenuType, MailBoxType } from "@/components/email/types";
import { useLayoutStore } from "@/store/app";
import { DIR } from "@/app/const";
const state = useLayoutStore();

const menu = ref<string>("email");
const isCompact = ref<boolean>(true);
const activeMenu = ref<ActiveMenuType>({
  email: "all",
  label: "",
  chat: "Scott Median"
});

const openEmail = ref<MailBoxType | null>(null);
const isOpenEmail = ref<boolean>(false);
const composeDialog = ref(false);
const isChatBox = ref(true);
const composeMenu = ref(false);

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});
const onMenuChange = (newMenu: string) => {
  menu.value = newMenu;
};

const onCompactChange = () => {
  isCompact.value = !isCompact.value;
};

const onComposeChangeMenu = (value: ActiveMenuType) => {
  activeMenu.value = value;

  if (value.chat !== "" && value.email === "" && value.label === "") {
    isChatBox.value = true;
  }
};

const onDialogClick = () => {
  composeDialog.value = true;
};

const onEmailClick = (mail: MailBoxType) => {
  openEmail.value = mail;
  isOpenEmail.value = true;
};

const onRightSideBarEmailClose = () => {
  isOpenEmail.value = false;
};

const onHideChatBox = () => {
  isChatBox.value = false;
};
</script>
<template>
  <v-row class="pt-5 d-flex flex-nowrap position-relative email-wrapper">
    <v-col cols="auto" class="d-none d-md-block">
      <EmailMenu
        v-model="menu"
        :isCompact="isCompact"
        @onMenuChange="onMenuChange"
        @onCompactChange="onCompactChange"
      />
    </v-col>
    <v-col
      :cols="isOpenEmail ? 3 : 2"
      md="4"
      :lg="isOpenEmail ? 3 : 2"
      class="px-1 d-none d-md-block"
    >
      <ComposeCard
        :menu="activeMenu"
        @onChangeMenu="onComposeChangeMenu"
        @onDialogClick="onDialogClick"
      />
    </v-col>
    <v-col md :lg="isOpenEmail ? 8 : 9" class="email-content ps-md-0">
      <EmailList
        :activeMenu="activeMenu"
        :isOpenEmail="isOpenEmail"
        @onEmailClick="onEmailClick"
        @onComposeMenuBtn="composeMenu = !composeMenu"
      />
    </v-col>
  </v-row>
  <ComposeDialog v-if="composeDialog" v-model="composeDialog" />
  <v-navigation-drawer
    class="email-details-navigation-drawer"
    width="500"
    v-model="isOpenEmail"
    :location="isRtl ? 'start' : 'end'"
  >
    <EmailDetail
      v-if="openEmail"
      :openEmail="openEmail"
      @onClose="onRightSideBarEmailClose"
    />
  </v-navigation-drawer>
  <v-navigation-drawer v-if="$vuetify.display.smAndDown" v-model="composeMenu">
    <v-card elevation="0">
      <v-card-text>
        <ComposeCard
          :menu="activeMenu"
          @onChangeMenu="onComposeChangeMenu"
          @onDialogClick="onDialogClick"
        />
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
  <ChatBox v-if="isChatBox" :chat="activeMenu.chat" @onClose="onHideChatBox" />
</template>
