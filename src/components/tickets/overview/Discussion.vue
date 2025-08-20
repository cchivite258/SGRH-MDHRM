<script lang="ts" setup>
import { type PropType } from "vue";
import { MessageType } from "@/components/tickets/overview/types";

defineProps({
  chats: {
    type: Array as PropType<MessageType[]>,
    default: () => [],
  },
});
</script>

<template>
  <div v-for="(chat, index) in chats" :key="'discussion-' + index" class="py-4">
    <div class="d-flex">
      <v-avatar size="small">
        <v-img :src="chat.src" />
      </v-avatar>
      <div class="ms-2">
        <span class="font-weight-bold"> {{ chat.name }} </span>
        <span class="text-muted ms-2 font-weight-bold">
          {{ chat.time }}
        </span>
        <div v-html="chat.message" />
        <div>
          <v-avatar v-for="image in chat.images" rounded class="me-2" size="80">
            <v-img :src="image" />
          </v-avatar>
        </div>
        <div>
          <v-btn variant="tonal" density="compact" class="mt-4 px-2">
            <i class="bx bxs-share me-1 text-muted" />
            <span class="text-muted font-weight-bold text-caption">Reply</span>
          </v-btn>
        </div>

        <Discussion :chats="chat.replies" />
      </div>
    </div>
  </div>
</template>
