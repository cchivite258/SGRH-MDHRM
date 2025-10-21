<script lang="ts" setup>
import {
  composeList,
  composeLabel,
  emailChats
} from "@/components/email/utils";

const emit = defineEmits(["onChangeMenu", "onLabelChange", "onDialogClick"]);
const props = defineProps({
  menu: {
    type: Object,
    default: { email: "all" }
  }
});

const onComposeMenuChange = (value: string) => {
  emit("onChangeMenu", {
    email: value,
    label: "",
    chat: props.menu.chat
  });
};

const onLabelChange = (value: string) => {
  emit("onChangeMenu", {
    email: "",
    label: value,
    chat: props.menu.chat
  });
};

const onChatClick = (chat: string) => {
  emit("onChangeMenu", {
    email: "",
    label: "",
    chat
  });
};

const onDialogClick = () => {
  emit("onDialogClick");
};
</script>
<template>
  <div>
    <v-card-text class="ps-0 pt-0 email-menu-sidebar-scroll" data-simplebar>
      <div class="mb-6 text-center">
        <v-hover>
          <template v-slot:default="{ isHovering, props }">
            <v-btn
              v-bind="props"
              color="primary"
              class="px-16"
              :variant="!isHovering ? 'tonal' : 'elevated'"
              @click="onDialogClick"
            >
              + <span class="font-weight-bold px-1">Compose</span>
            </v-btn>
          </template>
        </v-hover>
      </div>
      <v-list-item
        v-for="item in composeList"
        :key="'compose-list-' + item.id"
        class="text-muted"
        color="primary"
        density="compact"
        rounded
        variant="text"
        :active="menu.email === item.value"
        @click="onComposeMenuChange(item.value)"
      >
        <template #prepend>
          <i :class="item.icon" class="mx-2" />
        </template>
        <template v-if="item.count" #append>
          <v-badge color="light" rounded :content="item.count" inline />
        </template>
        <v-list-item-title class="text-caption font-weight-medium">
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>

      <div class="mt-4">
        <div class="font-weight-bold text-muted text-uppercase ms-3 mt-5 mb-2">
          labels
        </div>
        <v-list-item
          v-for="item in composeLabel"
          :key="'compose-label-' + item.id"
          class="text-muted"
          color="primary"
          density="compact"
          rounded
          :active="menu.label === item.value"
          @click="onLabelChange(item.value)"
        >
          <template #prepend>
            <i class="ph-circle mx-2" :class="'text-' + item.color"></i>
          </template>
          <template v-if="item.count" #append>
            <v-badge color="light" rounded="sm" :content="item.count" inline />
          </template>
          <v-list-item-title class="text-caption font-weight-medium">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </div>

      <v-divider class="my-4" />

      <div class="d-flex justify-space-between align-center">
        <span class="font-weight-bold text-muted text-uppercase"> Chat </span>
        <v-btn color="info" variant="tonal" :min-width="25" size="small">
          +
        </v-btn>
      </div>
      <div class="mt-3">
        <v-list-item
          v-for="(chat, index) in emailChats"
          :key="'email-chat-' + index"
          :active="chat.name === menu.chat"
          active-class="bg-primary-subtle"
          :ripple="false"
          @click="onChatClick(chat.name)"
        >
          <template #prepend>
            <v-avatar size="x-small">
              <v-img :src="chat.src" />
            </v-avatar>
          </template>
          <template #title>
            <div class="font-weight-bold">{{ chat.name }}</div>
          </template>
          <template #subtitle>
            <div>{{ chat.message }}</div>
          </template>
        </v-list-item>
      </div>
    </v-card-text>
  </div>
</template>
