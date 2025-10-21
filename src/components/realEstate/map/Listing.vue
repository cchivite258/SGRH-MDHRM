<script lang="ts" setup>
import { type PropType, computed } from "vue";
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

const preparedData = computed(() => {
  return prop.data;
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
  <v-card>
    <v-card-text>
      <div class="text-muted mb-3 d-flex">
        <b class="me-2">249 </b> items in
        <v-chip color="danger" density="compact" label class="mx-2">
          <span class="status-chip">Villa</span>
        </v-chip>
        <v-divider vertical class="me-2" />
        <div class="font-weight-bold simple-border px-2">$2000 - $3000</div>
        <v-divider vertical class="mx-2" />
        <div class="font-weight-bold simple-border px-2">4 Bedroom</div>
      </div>
      <div data-simplebar style="height: calc(100vh - 280px)">
        <v-card
          v-for="(item, index) in preparedData"
          :key="'real-estate-map-item-' + index"
          elevation="0"
          class="mb-5 position-relative"
        >
          <div class="real-estate-grid-card-option">
            <ListMenuWithIcon
              :menuItems="cardOptions"
              variant="tonal"
              @onSelect="onSelect($event, item)"
            />
          </div>
          <v-row no-gutters>
            <v-col lg="4" class="position-relative">
              <v-img
                height="170"
                class="rounded"
                cover
                :src="item.img"
                :alt="item.img_alt"
              />
              <PropertyTypeStatus
                class="real-estate-map-card-chip"
                :status="item.type"
                variant="elevated"
              />
            </v-col>
            <v-col lg="8" class="ps-5 mt-1">
              <div class="text-subtitle-1 font-weight-bold">
                {{ item.title }}
              </div>

              <div class="text-muted mb-3 mt-1 d-flex align-center">
                <i class="ph-map-pin me-1" /> {{ item.location }}
              </div>

              <v-row class="pb-10" no-gutters align="center">
                <v-col cols="auto" class="me-3">
                  <span> <i class="text-primary ph-house-line me-2" /> </span>
                  <span class="text-muted"> {{ item.bedroom }} Bedroom </span>
                </v-col>
                <v-col cols="auto" class="me-3">
                  <span> <i class="me-2 text-primary ph-bathtub" /> </span>
                  <span class="text-muted"> {{ item.bathroom }} Bathroom </span>
                </v-col>
                <v-col cols="auto">
                  <span> <i class="me-2 text-primary ph-square-logo" /> </span>
                  <span class="text-muted"> {{ item.area }} sqft</span>
                </v-col>
              </v-row>
              <v-divider class="mb-3" />
              <v-row justify="space-between">
                <v-col cols="auto" class="text-subtitle-1 font-weight-bold">
                  ${{ item.price }}
                </v-col>
                <v-col cols="auto">
                  <v-btn
                    color="primary"
                    variant="text"
                    to="/real-estate/property-overview"
                    class="font-weight-regular"
                  >
                    Read More <i class="ph-caret-right ms-1" />
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-divider v-if="index < data.length - 1" class="mt-5 mb-1" />
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>
