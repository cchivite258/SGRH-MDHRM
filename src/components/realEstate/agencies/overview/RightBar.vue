<script lang="ts" setup>
import {
  locationsOptions,
  propertyTypes,
  bedrooms,
} from "@/components/realEstate/grid/utils";
import { ref } from "vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

const location = ref("");
const propertyType = ref("Villa");
const bedroom = ref([]);
const price = ref([500, 3800]);
</script>
<template>
  <Card title="Request Exploration" elevation="0">
    <v-card-text>
      <TextField placeholder="Enter Name" />
      <TextField placeholder="Enter email" />
      <TextField placeholder="+(245) 451 45123" />
      <TextArea placeholder="Message" hide-details />
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
      <v-btn color="primary" variant="elevated" density="comfortable">
        Submit
      </v-btn>
    </v-card-actions>
  </Card>
  <Card title="Filters" elevation="0" class="mt-4">
    <template #title-action>
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <v-btn
            v-bind="props"
            icon="ph-funnel"
            density="compact"
            :variant="isHovering ? 'elevated' : 'text'"
            rounded
            color="secondary"
          />
        </template>
      </v-hover>
    </template>

    <v-card-text>
      <div class="text-muted text-uppercase font-weight-bold mb-3">
        Location
      </div>
      <MenuSelect v-model="location" class="mb-4" :items="locationsOptions" />

      <div class="text-muted text-uppercase font-weight-bold mt-5 mb-2">
        Property Type
      </div>

      <div>
        <v-tooltip
          v-for="property in propertyTypes"
          :key="property.value"
          location="top"
          :text="property.label"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              v-model="property.value"
              :value="property.value"
              color="primary"
              density="compact"
              icon
              rounded
              class="me-2"
              :variant="propertyType === property.value ? 'tonal' : 'text'"
              @click="propertyType = property.value"
            >
              <i :class="property.icon" />
            </v-btn>
          </template>
        </v-tooltip>
      </div>

      <div class="text-muted text-uppercase font-weight-bold mt-5 mb-2">
        Bedroom
      </div>
      <v-row no-gutters>
        <v-col
          cols="12"
          lg="6"
          v-for="item in bedrooms"
          :key="'bedroom-' + item.value"
        >
          <v-checkbox
            v-model="bedroom"
            :value="item.value"
            hide-details
            color="primary"
            density="compact"
          >
            <template #label>
              <span class="text-muted">{{ item.label }}</span>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>
      <div class="text-muted text-uppercase font-weight-bold mt-5 mb-2">
        Price Range
      </div>

      <v-range-slider
        v-model="price"
        strict
        min="0"
        max="5000"
        :step="1"
        density="compact"
        thumb-size="13"
        track-size="1"
      />

      <div class="d-flex align-center">
        <div class="product-price-grid">$ {{ price[0] }}</div>
        <span class="mx-3">to</span>
        <div class="product-price-grid">$ {{ price[1] }}</div>
      </div>
    </v-card-text>
  </Card>
  <v-card class="mt-4" elevation="0">
    <v-card-text>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6509156.773725123!2d-123.79622260161696!3d37.19312212390098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb9fe5f285e3d%3A0x8b5109a227086f55!2sCalifornia%2C%20USA!5e0!3m2!1sen!2sin!4v1678106410566!5m2!1sen!2sin"
        style="border: 0; height: 450px; width: 100%"
        :allowfullscreen="true"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </v-card-text>
  </v-card>
</template>
