<script lang="ts" setup>
const prop = defineProps({
  data: {
    type: Object,
    required: true
  }
});
</script>
<template>
  <v-card>
    <v-card-text>
      <div class="d-flex">
        <v-badge
          dot
          class="me-3"
          :color="data.isInactive ? 'danger' : 'success'"
        >
          <v-avatar :image="data.avatar" rounded size="50" />
        </v-badge>
        <div>
          <div class="text-subtitle-2">{{ data.name }}</div>
          <div class="text-muted">{{ data.designation }}</div>
        </div>
      </div>
      <div class="mt-5 text-muted">
        <div><i class="ph-phone me-2" /> {{ data.phone }}</div>
        <div class="my-2"><i class="ph-envelope me-2" /> {{ data.email }}</div>
        <div><i class="ph-map-pin me-2" /> {{ data.location }}</div>
      </div>
      <v-row class="mt-3">
        <v-col cols="6">
          <v-hover>
            <template v-slot:default="{ isHovering, props }">
              <v-btn
                v-bind="props"
                color="secondary"
                block
                :variant="!isHovering ? 'tonal' : 'elevated'"
              >
                <i class="ph-user me-1" />
                Profile
              </v-btn>
            </template>
          </v-hover>
        </v-col>
        <v-col cols="6">
          <v-btn color="primary" block>
            <i class="ph-chat-dots me-1" /> Contact US
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
