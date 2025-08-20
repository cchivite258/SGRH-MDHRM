<script lang="ts" setup>
import { ref, computed } from "vue";
import { notifications as data } from "@/components/layouts/utils";
import Notification from "@/components/layouts/topBar/Notification.vue";
import { DIR } from "@/app/const";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();

const options = ["All Clear", "Mark all as read", "Archive All"];
const notifications = ref(data);

const unreadMessages = computed(() => {
  return notifications.value.filter((notification) => !notification.isRead);
});
const readMessages = computed(() => {
  return notifications.value.filter((notification) => !!notification.isRead);
});

const isFooterVisible = computed(() => {
  return notifications.value.find((notification) => notification.isSelected);
});

const selectedMsg = computed(() => {
  return notifications.value.filter((notification) => notification.isSelected)
    .length;
});

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});
const onRemove = () => {
  notifications.value = notifications.value.filter(
    (notification) => !notification.isSelected
  );
};
</script>
<template>
  <v-menu :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn variant="text" v-bind="props" icon class="btn-ghost-dark">
        <v-badge
          color="danger"
          :content="unreadMessages.length"
          :location="isRtl ? 'left top' : 'end top'"
          offset-x="-3"
          offset-y="-7"
        >
          <i class="ph-thin ph-bell ph-xl"></i>
        </v-badge>
      </v-btn>
    </template>
    <v-card width="320" style="overflow: hidden">
      <v-card-title>
        <h5>
          <div class="text-subtitle-2 font-weight-medium">Notifications</div>
          <div class="notification-badge">
            {{ unreadMessages.length }}
          </div>
        </h5>
        <span class="font-weight-regular text-muted">
          You have
          <b> {{ unreadMessages.length }} </b> unread messages
        </span>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn variant="text" v-bind="props" icon class="notification-menu">
              <i class="ph ph-dots-three-vertical ph-lg"></i>
            </v-btn>
          </template>
          <v-list width="160" density="compact">
            <v-list-item
              class="dropdown-item"
              v-for="option in options"
              :key="option"
              height="28"
              min-height="28"
              @click=""
            >
              {{ option }}
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-title>
      <v-divider />
      <v-card-text data-simplebar style="max-height: 300px" class="px-2">
        <h5 class="text-muted my-2">NEW</h5>
        <div
          v-for="notification in unreadMessages"
          :key="notification.id"
          class="notification-item d-block dropdown-item position-relative unread-message"
        >
          <Notification :notification="notification" />
        </div>
        <h5 class="text-muted my-2 text-uppercase">Read Before</h5>

        <div
          v-for="notification in readMessages"
          :key="notification.id"
          class="notification-item d-block dropdown-item position-relative read-message"
        >
          <Notification :notification="notification" />
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions
        v-if="isFooterVisible"
        class="d-flex justify-center text-muted text-caption py-0"
      >
        Select {{ selectedMsg }} result
        <v-btn variant="text" color="danger" @click="onRemove"> Remove </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
