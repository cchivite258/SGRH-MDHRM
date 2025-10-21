<script lang="ts" setup>
import { computed } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import {
  brandOptions,
  categoryOptions,
  discountOptions,
} from "@/components/eCommerce/products/utils";

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

const brands = computed({
  get() {
    return prop.modelValue.brands || [];
  },
  set(brands: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      brands,
    });
  },
});

const categories = computed({
  get() {
    return prop.modelValue.category || [];
  },
  set(category: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      category,
    });
  },
});

const discount = computed({
  get() {
    return prop.modelValue.discount || [];
  },
  set(discount: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      discount,
    });
  },
});

const onClear = () => {
  emit("update:modelValue", {
    query: "",
    brands: [],
    category: "",
    discount: "",
  });
};
</script>
<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="3">
          <QuerySearch
            v-model="query"
            placeholder="Search products, price etc..."
          />
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <MenuSelect
            v-model="brands"
            multiple
            placeholder="Select Brands"
            :items="brandOptions"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <MenuSelect
            v-model="categories"
            placeholder="Select Category"
            :items="categoryOptions"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="lg">
          <MenuSelect
            v-model="discount"
            placeholder="Select Discount"
            :items="discountOptions"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="auto" class="d-flex align-center">
          <v-btn color="secondary" rounded="md" class="" block @click="onClear">
            Clear
            <i class="ph-funnel mx-1" />
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
