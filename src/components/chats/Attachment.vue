<script lang="ts" setup>
import { attachmentsData, attachmentOptions } from "@/components/chats/utils";
</script>
<template>
  <Card title="Attachment" class="h-100">
    <div data-simplebar class="px-1 chat-attachment-list">
      <v-row
        v-for="attachment in attachmentsData"
        :key="'chat-attachment-' + attachment.id"
        class="border mb-2 mx-2 pa-2 rounded align-center"
        no-gutters
      >
        <v-col cols="auto">
          <v-avatar size="small" variant="tonal" color="primary" class="mx-2">
            <i :class="attachment.icon"></i>
          </v-avatar>
        </v-col>
        <v-col cols>
          <h5 class="text-truncate mb-1 attach-file-name">
            {{ attachment.foldername }}
          </h5>
          <p class="text-muted mb-0">{{ attachment.size }}</p>
        </v-col>
        <v-col cols="auto">
          <v-btn icon="ph-download-simple" size="x-small" variant="text" />
          <ListMenuWithIcon
            icon="ph-dots-three ph-lg"
            :menuItems="attachmentOptions"
          />
        </v-col>
      </v-row>
    </div>
  </Card>
</template>
