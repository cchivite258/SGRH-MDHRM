<script lang="ts">
import { PropertyType } from "@/components/dashboard/realEstate/types";
import { type PropType } from "vue";
export default {
  props: {
    properties: {
      type: Array as PropType<PropertyType[]>,
      default: () => []
    }
  }
};
</script>
<template>
  <v-row
    v-for="(property, index) in properties"
    :key="'real-estate-property-' + index"
    no-gutters
  >
    <v-col cols class="d-flex align-center">
      <v-avatar size="x-large" rounded>
        <v-img :src="property.src" />
      </v-avatar>
      <div class="px-1">
        <div class="text-body-2 font-weight-bold my-1">
          {{ property.title }}
        </div>
        <div class="d-flex">
          <div class="d-flex align-center mx-1">
            <i class="text-primary ph-house" />
            <span class="text-muted mx-1">{{ property.bedroom }} Bedroom</span>
          </div>
          <div class="d-flex align-center mx-1">
            <i class="text-primary ph-house" />
            <span class="text-muted mx-1"
              >{{ property.bathRoom }} Bathroom</span
            >
          </div>
          <div class="d-flex align-center mx-1">
            <i class="text-primary ph-house" />
            <span class="text-muted mx-1">{{ property.sqft }} sqft</span>
          </div>
        </div>
      </div>
    </v-col>
    <v-col cols="auto">
      <v-chip
        label
        color="warning"
        class="d-flex align-center"
        density="compact"
      >
        <i class="bx bxs-star" />
        <span class="ps-1 text-caption font-weight-bold">{{
          property.rating
        }}</span>
      </v-chip>
    </v-col>
  </v-row>
</template>
