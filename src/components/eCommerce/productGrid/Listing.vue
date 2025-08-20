<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import Card from "@/components/eCommerce/productGrid/Card.vue";
import { productsGrid } from "@/components/eCommerce/productGrid/utils";
import { ProductGridType } from "@/components/eCommerce/productGrid/types";
import ConfirmationDialog from "@/app/common/components/ConfirmationDialog.vue";

const prop = defineProps({
  filters: {
    type: Object,
    default: {},
  },
});

const filteredProducts = ref<ProductGridType[]>(productsGrid);
const confirmationDialog = ref(false);
const deletedItem = ref<any>(null);
const select = ref("All Select");

const query = computed(() => {
  return prop.filters.query;
});

watch(query, (newQuery: string) => {
  filteredProducts.value = productsGrid.filter((product) => {
    const val = newQuery.toLowerCase();
    if (
      product.title.toLowerCase().includes(val) ||
      product.price.includes(val)
    ) {
      return product;
    }
  });
});

const category = computed(() => {
  return prop.filters.category;
});

watch(category, (newCategory: string) => {
  if (newCategory == "All") {
    filteredProducts.value = productsGrid;
  } else {
    filteredProducts.value = productsGrid.filter((product) => {
      return product.category === newCategory;
    });
  }
});

const discount = computed(() => {
  return prop.filters.discounts;
});

watch(discount, (newDiscount: number[]) => {
  if (newDiscount.length) {
    filteredProducts.value = productsGrid.filter((product) => {
      return newDiscount.includes(product.discount);
    });
  } else {
    filteredProducts.value = productsGrid;
  }
});

const onDelete = (product: ProductGridType) => {
  deletedItem.value = product;
  confirmationDialog.value = true;
};

const onConfirm = () => {
  filteredProducts.value = productsGrid.filter((product) => {
    return product.id !== deletedItem.value.id;
  });

  confirmationDialog.value = false;
};
</script>
<template>
  <div class="d-flex justify-space-between">
    <div class="d-flex align-center">
      <span class="text-subtitle-1 font-weight-bold"> Products </span>
      <v-chip label density="compact" color="secondary" class="mx-2">
        <span class="text-caption">254</span>
      </v-chip>
    </div>
    <div class="d-flex align-center">
      <v-select
        v-model="select"
        variant="plain"
        rounded
        density="compact"
        hide-details
        class="filter-select-item"
        :items="[
          'All Select',
          'Best Rated',
          'Best Selling',
          'Newest',
          'Trending',
        ]"
      />
      <v-btn color="primary" class="mx-2" to="/ecommerce/add-product">
        <i class="ph-plus-circle ph-lg me-1" /> Add Product
      </v-btn>
    </div>
  </div>
  <div class="mt-5">
    <div v-if="!filteredProducts.length" class="text-center pt-14">
      <div class="mb-3">
        <v-avatar size="80" color="primary" variant="tonal">
          <i class="ph-magnifying-glass ph-lg"></i>
        </v-avatar>
      </div>
      <span class="text-subtitle-1 font-weight-bold"
        >No matching records found</span
      >
    </div>
    <v-row v-else>
      <v-col
        sm="6"
        lg="3"
        v-for="(product, index) in filteredProducts"
        :key="'grid-product-' + index"
      >
        <Card :product="product" @onDelete="onDelete" />
      </v-col>
    </v-row>
  </div>

  <div class="mt-3">
    <v-pagination
      :length="2"
      density="compact"
      color="primary"
      variant="text"
      total-visible="3"
      prev-icon="ph-arrow-left"
      next-icon="ph-arrow-right"
      class="table-pagination"
    />
  </div>

  <ConfirmationDialog v-model="confirmationDialog" @onConfirm="onConfirm">
    <v-btn
      variant="text"
      class="confirm-close-icon"
      icon="ph-x"
      @click="confirmationDialog = false"
    />

    <v-card-text class="text-center ma-md-5">
      <div class="text-danger">
        <i class="ph ph-trash ph-4x"></i>
      </div>
      <div class="mt-4">
        <h4>Are you sure ?</h4>
        <p class="text-muted mx-4 mb-0 text-subtitle-1">
          Are you sure you want to remove this record ?
        </p>
      </div>
    </v-card-text>
  </ConfirmationDialog>
</template>
