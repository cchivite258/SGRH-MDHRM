<script lang="ts" setup>
import { gridMarkup } from "@/components/ui/cards/utils";
</script>
<template>
  <div class="font-weight-bold text-subtitle-1 text-decoration-underline my-4">Using Grid Markup</div>
  <v-row>
    <v-col
      v-for="(item, index) in gridMarkup"
      :key="'gridMarkup-' + index"
      cols="12"
      lg="lg"
    >
      <v-card>
        <v-card-text>
          <div class="d-flex">
            <v-avatar :image="item.src" class="me-3" />
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ item.name }}
              </div>
              <div>{{ item.designation }}</div>
            </div>
          </div>
          <div class="mt-3 font-weight-bold">
            {{ item.price }}
          </div>
          <div class="text-muted">{{ item.type }}</div>
          <v-btn block color="primary" density="compact" class="mt-4">
            See Details
          </v-btn>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
