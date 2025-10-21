<script lang="ts" setup>
import { type PropType, computed } from "vue";
import { FiltersType } from "@/components/realEstate/grid/types";
import {
  locationsOptions,
  propertyTypes,
  bedrooms,
  bathrooms,
  featureOptions,
} from "@/components/realEstate/grid/utils";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

const emit = defineEmits(["onToggleFilter", "update:modelValue"]);

const prop = defineProps({
  modelValue: {
    type: Object as PropType<FiltersType>,
    required: true,
  },
});

const location = computed({
  get() {
    return prop.modelValue.location || "";
  },
  set(updatedLocation: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      location: updatedLocation,
    });
  },
});

const propertyType = computed({
  get() {
    return prop.modelValue.propertyType || "";
  },
  set(updatedProperty: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      propertyType: updatedProperty,
    });
  },
});

const bedroom = computed({
  get() {
    return prop.modelValue.bedroom || [];
  },
  set(updatedVal: string[]) {
    emit("update:modelValue", {
      ...prop.modelValue,
      bedroom: updatedVal,
    });
  },
});

const price = computed({
  get() {
    return prop.modelValue.price || [];
  },
  set(updatedVal: number[]) {
    emit("update:modelValue", {
      ...prop.modelValue,
      price: updatedVal,
    });
  },
});

const bathroom = computed({
  get() {
    return prop.modelValue.bathroom || [];
  },
  set(updatedVal: string[]) {
    emit("update:modelValue", {
      ...prop.modelValue,
      bathroom: updatedVal,
    });
  },
});

const features = computed({
  get() {
    return prop.modelValue.features || [];
  },
  set(updatedVal: string[]) {
    emit("update:modelValue", {
      ...prop.modelValue,
      features: updatedVal,
    });
  },
});
</script>
<template>
  <Card title="Filters" title-class="py-4">
    <template #title-action>
      <v-btn
        icon="ph-caret-left ph-sm"
        variant="elevated"
        color="light"
        rounded
        density="compact"
        @click="emit('onToggleFilter')"
      />
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

      <div class="text-muted text-uppercase font-weight-bold mt-5 mb-2">
        Bathroom
      </div>
      <v-row no-gutters>
        <v-col
          cols="12"
          lg="6"
          v-for="item in bathrooms"
          :key="'bathroom-' + item.value"
        >
          <v-checkbox
            v-model="bathroom"
            :value="item.value"
            hide-details
            color="primary"
            density="compact"
          >
            <template #label>
              <span class="text-muted">{{ item.title }}</span>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>

      <div class="text-muted text-uppercase font-weight-bold mt-5 mb-2">
        Features
      </div>
      <v-row no-gutters>
        <v-col
          cols="12"
          lg="6"
          v-for="item in featureOptions"
          :key="'features-' + item.value"
        >
          <v-checkbox
            v-model="features"
            :value="item.value"
            hide-details
            color="primary"
            density="compact"
          >
            <template #label>
              <span class="text-muted">{{ item.title }}</span>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
