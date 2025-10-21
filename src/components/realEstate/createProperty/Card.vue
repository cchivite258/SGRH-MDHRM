<script lang="ts" setup>
import { ref } from "vue";
import { cardOptions } from "@/components/realEstate/grid/utils";
import { properties } from "@/components/realEstate/utils";
import PropertyTypeStatus from "@/components/realEstate/PropertyTypeStatus.vue";

const item = ref(properties[properties.length - 1]);
</script>
<template>
  <v-hover>
    <template v-slot:default="{ isHovering, props }">
      <v-card
        :elevation="isHovering ? 5 : ''"
        v-bind="props"
        width="100%"
        class="curser-pointer position-relative"
      >
        <v-btn
          icon
          density="compact"
          :color="item.isBookmark ? 'warning' : ''"
          rounded
          class="real-estate-grid-card-rating"
          variant="elevated"
          @click="item.isBookmark = !item.isBookmark"
        >
          <i class="bx" :class="item.isBookmark ? ' bxs-star' : ' bx-star'" />
        </v-btn>

        <div class="real-estate-grid-card-option">
          <ListMenuWithIcon :menuItems="cardOptions" variant="elevated" />
        </div>
        <div class="px-2 pt-2">
          <v-img
            :src="item.img"
            :alt="item.img_alt"
            height="240"
            cover
            class="rounded"
          />
        </div>
        <v-card-text>
          <div class="d-flex justify-space-between mb-3">
            <PropertyTypeStatus :status="item.type" />
            <div class="d-flex align-center">
              <i class="ph-star text-warning me-1" />
              <span class="text-muted">{{ item.rating }}</span>
            </div>
          </div>
          <div class="text-subtitle-1 font-weight-bold text-truncate">
            {{ item.title }}
          </div>
          <div class="text-muted mb-3 d-flex align-center">
            <i class="ph-map-pin me-1" /> {{ item.location }}
          </div>
          <v-row no-gutters>
            <v-col cols="auto" class="me-4">
              <span> <i class="text-primary ph-house-line me-2" /> </span>
              <span class="text-muted"> {{ item.bedroom }} Bedroom </span>
            </v-col>
            <v-col cols="auto" class="me-4">
              <span> <i class="me-2 text-primary ph-bathtub" /> </span>
              <span class="text-muted"> {{ item.bathroom }} Bathroom </span>
            </v-col>
            <v-col cols="auto" class="me-4">
              <span> <i class="me-2 text-primary ph-square-logo" /> </span>
              <span class="text-muted"> {{ item.area }} sqft</span>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-3">
          <v-row justify="space-between">
            <v-col cols="auto" class="text-subtitle-1 font-weight-bold">
              ${{ item.price }}
            </v-col>
            <v-col cols="auto">
              <v-btn color="primary">
                Read More <i class="ph-caret-right ms-1" />
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </template>
  </v-hover>
</template>
