<script lang="ts" setup>
import { callsData } from "@/components/chats/utils";
</script>
<template>
  <Card title="Calls" class="h-100">
    <v-card-text data-simplebar class="px-1 chat-call-list">
      <div
        v-for="call in callsData"
        :key="'chat-call-' + call.id"
        class="d-flex align-center mb-3 justify-space-between"
      >
        <div class="d-flex align-center">
          <v-avatar size="x-small" color="primary" class="mx-2">
            <v-img v-if="call.image" :src="call.image" />
            <span> {{ call.profile }} </span>
          </v-avatar>
          <div>
            <p class="mb-0 font-weight-bold">{{ call.name }}</p>
            <div class="text-muted text-caption">
              <i
                v-if="call.isArrow"
                class="ph ph-arrow-down-left text-success"
              ></i>
              <i v-else class="ph ph-arrow-up-right text-danger"></i
              >{{ call.date }}
            </div>
          </div>
        </div>
        <div>
          <div class="d-flex align-center gap-3">
            <div>
              <h5 class="mb-0 text-muted">{{ call.time }}</h5>
            </div>
            <div>
              <v-btn
                icon
                variant="text"
                class="stretched-link ms-1"
                size="x-small"
                color="primary"
              >
                <i :class="call.icon" class="ph-lg"></i>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </Card>
</template>
