<script lang="ts" setup>
import { alignment } from "@/components/ui/cards/utils";
</script>
<template>
  <div class="font-weight-bold text-subtitle-1 text-decoration-underline my-6">
    Card Text Alignment
  </div>

  <v-row>
    <v-col v-for="(item, i) in alignment" :key="'alignment-' + i">
      <v-card :class="'text-' + item.align">
        <v-card-title>
          <v-avatar color="success" rounded variant="tonal">
            <i :class="item.icon" />
          </v-avatar>
        </v-card-title>
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">{{ item.title }}</div>
          <div>
            <p class="text-muted">
              Send a link to apply on mobile device. Appropriately communicate
              one-to-one technology.
            </p>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn color="success" variant="elevated" block>{{
            item.btnText
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
