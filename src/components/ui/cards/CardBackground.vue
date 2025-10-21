<script lang="ts" setup>
import { cardBackground } from "@/components/ui/cards/utils";
</script>
<template>
  <div class="font-weight-bold text-subtitle-1 text-decoration-underline my-4">
    Card Background Color
  </div>

  <v-row>
    <v-col
      cols="12"
      lg="4"
      v-for="(item, index) in cardBackground"
      :key="'cardBackground-' + index"
    >
      <v-card :class="'bg-' + item.color">
        <v-card-text>
          <div class="d-flex align-center">
            <v-avatar :image="item.src" class="me-3" />
            <div v-html="item.title" />
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-center">
          Connect Now <i class="ph-caret-right ms-1" />
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
