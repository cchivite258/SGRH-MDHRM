<script lang="ts" setup>
import { bookmarkData, bookmarkOptions } from "@/components/chats/utils";
</script>
<template>
  <Card title="Bookmark" class="h-100">
    <v-card-text data-simplebar class="px-1 chat-bookmark-list">
      <div
        v-for="(bookmark, index) in bookmarkData"
        :key="'bookmark-' + bookmark.id"
      >
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="small" class="mx-2">
            <i :class="bookmark.icon" />
          </v-avatar>
          <div class="flex-grow-1 overflow-hidden">
            <h5 class="mb-1 text-truncate font-weight-medium">
              {{ bookmark.fileName }}
            </h5>
            <p class="text-muted mb-0">{{ bookmark.size }}</p>
          </div>
          <ListMenuWithIcon
            icon="ph-dots-three ph-lg"
            :menuItems="bookmarkOptions"
          />
        </div>
        <v-divider v-if="index !== bookmarkData.length - 1" class="my-2" />
      </div>
    </v-card-text>
  </Card>
</template>
