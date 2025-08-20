<script lang="ts" setup>
import { ref, type PropType, computed } from "vue";
import { PropertyType } from "@/components/realEstate/types";

const prop = defineProps({
  data: {
    type: Array as PropType<PropertyType[]>,
    default: () => [],
  },
});
</script>
<template>
  <div data-simplebar style="height: 600px">
    <v-card
      v-for="(item, index) in data"
      :key="'agent-list-view-item-' + index"
      elevation="0"
      class="mt-3"
    >
      <v-card-text>
        <v-row>
          <v-col lg="2">
            <v-img height="130" cover :src="item.img" class="rounded" />
          </v-col>
          <v-col lg="10">
            <div class="d-flex justify-space-between">
              <span class="text-subtitle-1 font-weight-bold">
                {{ item.title }}
              </span>
              <span class="text-subtitle-1 font-weight-bold">
                ${{ item.price }}
              </span>
            </div>
            <div class="text-muted mb-3 mt-1 d-flex align-center">
              <i class="ph-map-pin me-1" /> {{ item.location }}
            </div>
            <v-row class="pb-3" no-gutters align="center">
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
            <div class="text-muted d-flex justify-space-between">
              <span>
                Agent: <b> {{ item.agent }} </b>
              </span>
              <span>
                <v-btn
                  color="primary"
                  variant="text"
                  to="/real-estate/property-overview"
                >
                  Read More <i class="ph-caret-right ms-1" />
                </v-btn>
              </span>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
