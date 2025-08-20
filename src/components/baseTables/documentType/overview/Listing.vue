<script lang="ts" setup>
import { ref } from "vue";
import Listing from "@/components/realEstate/grid/Listing.vue";
import { properties } from "@/components/realEstate/utils";
import { PropertyType } from "@/components/realEstate/types";
import ListView from "@/components/realEstate/agent/overview/ListView.vue";
import Pagination from "@/app/common/components/Pagination.vue";

const listingType = ref("grid");
const page = ref(1);
const filteredItems = ref<PropertyType[]>(properties);
</script>
<template>
  <Card title="Active Listing" class="mt-5" title-class="py-4">
    <template #title-action>
      <div>
        <v-hover>
          <template v-slot:default="{ isHovering, props }">
            <v-btn
              v-bind="props"
              icon="ph-squares-four"
              color="secondary"
              density="comfortable"
              elevation="0"
              :variant="
                !isHovering && listingType === 'list' ? 'tonal' : 'elevated'
              "
              rounded
              class="me-2"
              @click="listingType = 'grid'"
            />
          </template>
        </v-hover>
        <v-hover>
          <template v-slot:default="{ isHovering, props }">
            <v-btn
              v-bind="props"
              icon="ph-list-bullets"
              color="secondary"
              density="comfortable"
              elevation="0"
              :variant="
                !isHovering && listingType === 'grid' ? 'tonal' : 'elevated'
              "
              rounded
              @click="listingType = 'list'"
            />
          </template>
        </v-hover>
      </div>
    </template>
  </Card>

  <v-card-text class="pa-0">
    <Listing v-if="listingType === 'grid'" :data="filteredItems" />
    <ListView v-if="listingType === 'list'" :data="filteredItems" />
    <Pagination v-if="filteredItems.length" v-model="page" />
  </v-card-text>
</template>
