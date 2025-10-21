<script lang="ts" setup>
import { ref } from "vue";
import Gallery from "@/components/realEstate/overview/Gallery.vue";
import PropertyOverview from "@/components/realEstate/overview/PropertyOverview.vue";
import RightSidebar from "@/components/realEstate/overview/RightSidebar.vue";
import Location from "@/components/realEstate/overview/Location.vue";
const isBookmark = ref(false);
</script>
<template>
  <v-row>
    <v-col cols="12" xl="9" lg="8">
      <v-card>
        <v-card-text>
          <Gallery />
          <div class="d-flex justify-space-between mt-4">
            <div class="text-subtitle-1 font-weight-medium">
              Swimming Pool Side Of The Residential Ascot Home
            </div>
            <v-btn
              icon
              density="compact"
              color="warning"
              rounded
              :variant="isBookmark ? 'elevated' : 'tonal'"
              @click="isBookmark = !isBookmark"
            >
              <i class="bx" :class="isBookmark ? ' bxs-star' : ' bx-star'" />
            </v-btn>
          </div>
          <div class="d-flex text-muted mt-1">
            <span class="d-flex align-center">
              <i class="ph-map-pin me-1" />
              <span> Birmingham, West Midlands, United Kingdom</span>
            </span>
            <v-divider vertical class="mx-2 border-opacity-80" />
            <span class="d-flex align-center">
              <i class="ph-calendar-blank me-1" /> Update 2 days ago
            </span>
          </div>

          <p class="text-muted mb-2 mt-3">
            Property is
            <b>any item that a person or a business has legal title over</b>.
            Property can be tangible items, such as houses, cars, or appliances,
            or it can refer to intangible items that carry the promise of future
            worth, such as stock and bond certificates. There are two types of
            property. In legal terms, all property will be classified as either
            <b>personal property or real property</b>. This distinction between
            types of property comes from English common law, but our modern laws
            continue to distinguish between the two.
          </p>
          <p class="text-muted">
            Basic Property Unit. Definition. The basic unit of ownership that is
            recorded in the land books, land registers or equivalent. It is
            defined by unique ownership and homogeneous real property rights,
            and may consist of one or more adjacent or geographically separate
            parcels.
          </p>
        </v-card-text>
        <PropertyOverview />
      </v-card>
      <Location class="mt-4" />
    </v-col>
    <v-col xl="3" lg="4">
      <RightSidebar />
    </v-col>
  </v-row>
</template>
