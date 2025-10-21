<script lang="ts" setup>
import { computed } from "vue";
import { chats, channelsData } from "@/components/chats/utils";
import { useLayoutStore } from "@/store/app";
import { DIR } from "@/app/const";
const state = useLayoutStore();

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: Object
});

const selectedUser = computed({
  get() {
    return props.modelValue?.user;
  },
  set(newUser: any) {
    emit("update:modelValue", { user: newUser, channel: null });
  }
});

const selectedChanel = computed({
  get() {
    return props.modelValue?.channel;
  },
  set(newChanel: any) {
    emit("update:modelValue", { channel: newChanel, user: null });
  }
});

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});
</script>
<template>
  <Card title="Chats" class="chat-leftsidebar h-100">
    <template #title-action>
      <v-tooltip text="Add contact">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="primary"
            variant="tonal"
            min-width="30"
            size="small"
          >
            +
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <v-container data-simplebar style="max-height: calc(100dvh - 200px)">
      <TextField
        variant="solo"
        placeholder="Search here..."
        single-line
        hide-details
        class="mb-4 search-box"
      >
        <template #prepend-inner>
          <i class="ph-magnifying-glass text-muted" />
        </template>
      </TextField>
      <v-list
        v-model="selectedUser"
        :lines="false"
        density="compact"
        nav
        class="px-0"
      >
        <v-list-item
          v-for="(chat, i) in chats"
          :key="'chat-' + chat.roomId"
          color="primary"
          variant="elevated"
          elevation="0"
          :ripple="false"
          min-height="30"
          height="35"
          :active="selectedUser && selectedUser.name === chat.name"
          @click="selectedUser = chat"
        >
          <template #append>
            <v-badge
              v-if="chat.channels"
              color="light"
              rounded
              :content="chat.channels"
              inline
            />
          </template>
          <v-list-item-title
            :class="chat.channels ? 'font-weight-bold' : 'font-weight-medium'"
            class="d-flex align-center"
          >
            <v-badge
              dot
              :color="chat.status ? 'success' : 'warning'"
              :location="!isRtl ? 'bottom right' : 'bottom left'"
              class="mx-2"
            >
              <v-avatar size="x-small" color="primary">
                <v-img v-if="chat.src" :src="chat.src" />
                <span v-else> {{ chat.profile }} </span>
              </v-avatar>
            </v-badge>
            {{ chat.name }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <div class="d-flex justify-space-between align-center mt-10">
        <div class="text-uppercase text-muted font-weight-bold">Channels</div>
        <v-tooltip text="Create Group">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              color="success"
              variant="tonal"
              min-width="30"
              size="small"
            >
              +
            </v-btn>
          </template>
        </v-tooltip>
      </div>
      <v-list
        v-model="selectedChanel"
        :lines="false"
        density="compact"
        nav
        class="px-0"
      >
        <v-list-item
          v-for="(chat, i) in channelsData"
          :key="'chat-channel-' + chat.chat_id"
          :value="selectedChanel && chat.chat_id"
          color="primary"
          variant="elevated"
          elevation="0"
          min-height="30"
          height="35"
          :active="selectedChanel && chat.name === selectedChanel.name"
          @click="selectedChanel = chat"
        >
          <template #prepend>
            <v-avatar size="x-small" color="light"> # </v-avatar>
          </template>
          <template #append>
            <v-badge
              v-if="chat.channels"
              color="light"
              rounded
              :content="chat.channels"
              inline
            />
          </template>

          <v-list-item-title class="font-weight-bold">
            {{ chat.name }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-container>
  </Card>
</template>
