<script lang="ts" setup>
import { type PropType } from "vue";
import { PropertyType } from "@/components/realEstate/types";
import PropertyTypeStatus from "@/components/realEstate/PropertyTypeStatus.vue";
import { cardOptions } from "@/components/realEstate/grid/utils";

const emit = defineEmits(["onEdit", "onDelete"]);
const prop = defineProps({
  data: {
    type: Array as PropType<PropertyType[]>,
    default: () => [],
  },
});

const onSelect = (option: string, value: PropertyType) => {
  switch (option) {
    case "edit":
      emit("onEdit", value);
      break;

    case "delete":
      emit("onDelete", value.id);
      break;

    default:
      break;
  }
};
</script>
<template>
  <div v-if="!data.length" class="text-center pt-14">
    <div class="mb-3">
      <v-avatar size="80" color="primary" variant="tonal">
        <i class="ph-magnifying-glass ph-lg"></i>
      </v-avatar>
    </div>
    <span class="text-subtitle-1 font-weight-bold"
      >No matching records found</span
    >
  </div>
  <v-row>
    <v-col
      cols="12"
      sm="6"
      md="4"
      lg="4"
      xl="3"
      v-for="(item, index) in data"
      :key="'property-card-' + index"
    >
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <v-card
            :elevation="isHovering ? 3 : ''"
            v-bind="props"
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
              <i
                class="bx"
                :class="item.isBookmark ? ' bxs-star' : ' bx-star'"
              />
            </v-btn>

            <div class="real-estate-grid-card-option">
              <ListMenuWithIcon
                :menuItems="cardOptions"
                variant="elevated"
                @onSelect="onSelect($event, item)"
              />
            </div>
            <div class="px-2 pt-2">
              <v-img
                :src="item.img"
                :alt="item.img_alt"
                height="180"
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
                  <v-btn color="primary" class="font-weight-regular">
                    Read More <i class="ph-caret-right ms-1" />
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </template>
      </v-hover>
    </v-col>
  </v-row>
</template>
