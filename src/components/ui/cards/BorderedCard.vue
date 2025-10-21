<script lang="ts" setup>
import { borderedCard } from "@/components/ui/cards/utils";
</script>
<template>
  <div class="font-weight-bold text-subtitle-1 text-decoration-underline my-4">
    Card Border Color
  </div>

  <v-row>
    <v-col
      cols="12"
      lg="4"
      v-for="(item, index) in borderedCard"
      :key="'borderedCard-' + index"
    >
      <v-card border elevation="0">
        <v-card-title class="d-flex justify-space-between">
          <div>
            <span class="text-subtitle-2 font-weight-bold me-2">
              {{ item.title }}
            </span>
            <v-chip
              v-if="item.tag"
              :color="item.tagColor"
              label
              density="compact"
              variant="elevated"
              elevation="0"
              class="px-2"
            >
              {{ item.tag }}
            </v-chip>
          </div>
          <div>{{ item.percent }}</div>
        </v-card-title>
        <v-card-text class="pb-0">
          <p>{{ item.detail }}</p>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn :color="item.color">
            Read More <i class="ph-arrow-right" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
