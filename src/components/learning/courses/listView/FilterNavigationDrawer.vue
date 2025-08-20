<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  courseOptions,
  ratingOptions,
} from "@/components/learning/courses/listView/utils";

const emit = defineEmits(["update:modelValue", "onConfirm"]);

const selectedPrice = ref([100, 1000]);
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});
</script>
<template>
  <v-card width="400" style="overflow: hidden">
    <v-card-title> Filters </v-card-title>
    <v-divider />
    <v-card-text
      data-simplebar
      style="height: calc(100vh - 350px); overflow-x: hidden"
    >
      <v-range-slider
        v-model="selectedPrice"
        strict
        min="0"
        max="2000"
        :step="1"
        density="compact"
        thumb-size="13"
        track-size="1"
      />

      <div class="d-flex align-center">
        <div class="product-price-grid">
          {{ selectedPrice[0] }}
        </div>
        <span class="mx-3">to</span>
        <div class="product-price-grid">
          {{ selectedPrice[1] }}
        </div>
      </div>

      <div>
        <div class="font-weight-bold text-decoration-underline my-3">
          Courses Category
        </div>
        <v-checkbox
          v-for="(brand, index) in courseOptions"
          :key="'product-grid-brand-' + index"
          :label="brand.label"
          :value="brand.value"
          color="primary"
          hide-details
          class="product-grid-brand"
        >
          <template #label>
            <span class="text-muted">{{ brand.label }}</span>
          </template>
        </v-checkbox>
      </div>

      <div>
        <div class="font-weight-bold text-decoration-underline my-3">
          Ratings
        </div>
        <v-checkbox
          v-for="(rating, index) in ratingOptions"
          :key="'product-grid-rating-' + index"
          :label="rating.label"
          :value="rating.value"
          color="primary"
          hide-details
          class="product-grid-brand"
        >
          <template #label>
            <v-rating
              v-if="rating.value"
              :model-value="rating.value"
              density="compact"
              readonly
              color="warning"
            />
            <span class="text-muted">{{ rating.label }}</span>
          </template>
        </v-checkbox>
      </div>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-row>
        <v-col cols>
          <v-btn variant="tonal" color="danger" block>
            <i class="ph-x" /> Reset
          </v-btn>
        </v-col>
        <v-col cols>
          <v-btn variant="elevated" color="secondary" block>
            <i class="ph-funnel" /> Filter
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>
