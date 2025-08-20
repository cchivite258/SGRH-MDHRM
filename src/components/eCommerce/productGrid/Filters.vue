<script lang="ts" setup>
import { computed, ref } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import {
  categoryOptions,
  colors,
  brands,
  discountOptions,
} from "@/components/eCommerce/productGrid/utils";

const panel1 = ref([0]);
const panel2 = ref([0]);
const panel3 = ref([0]);
const panel4 = ref([0]);
const emit = defineEmits(["update:modelValue"]);
const prop = defineProps({
  modelValue: {
    type: Object,
    default: () => {},
  },
});

const query = computed({
  get() {
    return prop.modelValue.query || "";
  },
  set(updatedQuery: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      query: updatedQuery,
    });
  },
});

const selectedCategory = computed({
  get() {
    return prop.modelValue.category || "";
  },
  set(category: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      category,
    });
  },
});

const selectedPrice = computed({
  get() {
    return prop.modelValue.price || [0, 0];
  },
  set(price: number[]) {
    emit("update:modelValue", {
      ...prop.modelValue,
      price,
    });
  },
});

const selectedBrands = computed({
  get() {
    return prop.modelValue.brands || [];
  },
  set(brands: number[]) {
    emit("update:modelValue", {
      ...prop.modelValue,
      brands,
    });
  },
});

const selectedColor = computed({
  get() {
    return prop.modelValue.color || "";
  },
  set(color: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      color,
    });
  },
});

const selectedDiscounts = computed({
  get() {
    return prop.modelValue.discounts || [];
  },
  set(discounts: string[]) {
    emit("update:modelValue", {
      ...prop.modelValue,
      discounts,
    });
  },
});

const onCategoryClick = (value: string) => {
  selectedCategory.value = value;
};
</script>
<template>
  <Card title="Filters">
    <template #title-action>
      <v-btn class="" variant="text">
        <span class="text-decoration-underline">Clear All</span>
      </v-btn>
    </template>
    <v-card-text>
      <QuerySearch
        v-model="query"
        placeholder="Search products, category, etc..."
      />

      <v-expansion-panels class="mt-4 expansion-panels" v-model="panel1">
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title
            class="text-primary bg-primary-subtle text-caption font-weight-medium"
          >
            Product Category
          </v-expansion-panel-title>
          <v-divider />
          <v-expansion-panel-text>
            <v-list-item
              v-for="(category, index) in categoryOptions"
              :key="'product-grid-category-' + index"
              density="compact"
              :active="selectedCategory === category.title"
              @click="onCategoryClick(category.title)"
            >
              <div class="d-flex justify-space-between">
                <span class="font-weight-bold">
                  {{ category.title }}
                </span>
                <v-badge
                  v-if="category.count"
                  inline
                  :content="category.count"
                  color="light"
                  rounded="lg"
                >
                </v-badge>
              </div>
            </v-list-item>
          </v-expansion-panel-text>

          <v-divider />
        </v-expansion-panel>
      </v-expansion-panels>
      <v-expansion-panels class="mt-4 expansion-panels" v-model="panel2">
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title
            class="text-primary bg-primary-subtle text-caption font-weight-medium"
          >
            Price
          </v-expansion-panel-title>
          <v-divider />
          <v-expansion-panel-text>
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
          </v-expansion-panel-text>

          <v-divider />
        </v-expansion-panel>
      </v-expansion-panels>
      <v-expansion-panels class="mt-4 expansion-panels" v-model="panel3">
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title
            class="text-primary bg-primary-subtle text-caption font-weight-medium"
          >
            Colors
          </v-expansion-panel-title>
          <v-divider />
          <v-expansion-panel-text>
            <v-chip
              rounded="sm"
              variant="tonal"
              density="comfortable"
              v-for="color in colors"
              :color="color.color"
              class="ma-1"
              :key="'product-grid-color-' + color.color"
              @click="selectedColor = color.color"
              >{{ color.title }}</v-chip
            >
          </v-expansion-panel-text>
          <v-divider />
        </v-expansion-panel>
      </v-expansion-panels>
      <v-expansion-panels class="mt-4 expansion-panels" v-model="panel4">
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title
            class="text-primary bg-primary-subtle text-caption font-weight-medium"
          >
            Brands <v-badge content="3" color="primary" inline rounded />
          </v-expansion-panel-title>
          <v-divider />
          <v-expansion-panel-text>
            <v-checkbox
              v-for="(brand, index) in brands"
              :key="'product-grid-brand-' + index"
              v-model="selectedBrands"
              :label="brand.title"
              :value="brand.title"
              color="primary"
              hide-details
              class="product-grid-brand"
            >
              <template #label>
                <span class="text-muted">{{ brand.title }}</span>
              </template>
            </v-checkbox>
            <v-btn color="primary" variant="text">
              <span class="font-weight-bold">1,235 More</span>
            </v-btn>
          </v-expansion-panel-text>
          <v-divider />
        </v-expansion-panel>
      </v-expansion-panels>
      <v-expansion-panels class="mt-4 expansion-panels">
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title
            class="text-primary bg-primary-subtle text-caption font-weight-medium"
          >
            Discount
          </v-expansion-panel-title>
          <v-divider />
          <v-expansion-panel-text>
            <v-checkbox
              v-for="(discount, index) in discountOptions"
              :key="'product-grid-discount-' + index"
              v-model="selectedDiscounts"
              :label="discount.title"
              :value="discount.value"
              color="primary"
              hide-details
              class="product-grid-discount"
            >
              <template #label>
                <span class="text-muted">{{ discount.title }}</span>
              </template>
            </v-checkbox>
          </v-expansion-panel-text>
          <v-divider />
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </Card>
</template>
