<script lang="ts" setup>
import { computed } from "vue";
import { DIR } from "@/app/const";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();

const prop = defineProps({
  notification: {
    type: Object,
    required: true,
  },
});

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});
</script>
<template>
  <div class="d-flex">
    <div class="position-relative me-3 flex-shrink-0">
      <v-badge
        v-if="notification.src"
        :color="notification.isRead ? 'warning' : 'success'"
        dot
        :location="!isRtl ? 'bottom end' : 'bottom left'"
      >
        <img
          :src="notification.src"
          class="rounded-circle avatar-xs"
          alt="user-pic"
        />
      </v-badge>
      <v-chip
        v-if="notification.icon"
        :color="`red-lighten-1`"
        class="ms-0 me-2"
        small
      >
        <i :class="notification.icon"></i>
      </v-chip>
    </div>
    <div>
      <div href="#!" class="stretched-link">
        <h6 class="mt-0 mb-1 text-subtitle-2 font-weight-bold mb-1">
          {{ notification.title }}
        </h6>
      </div>
      <div>
        <p class="mb-1" v-html="notification.message"></p>
      </div>
      <p class="mb-0 font-weight-medium text-uppercase text-muted">
        <span>
          <i class="mdi mdi-clock-outline"></i> {{ notification.time }}
        </span>
      </p>
    </div>
    <div class="px-2 fs-base">
      <div class="form-check notification-check">
        <v-checkbox
          v-model="notification.isSelected"
          class="form-check-input"
          type="checkbox"
          id="all-notification-check02"
        />
      </div>
    </div>
  </div>
</template>
