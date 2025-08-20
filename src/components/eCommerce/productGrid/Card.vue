<script lang="ts" setup>
import { computed } from "vue";

const emit = defineEmits(["onDelete"]);

const prop = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const isDiscount = computed(() => {
  return parseFloat(prop.product.discount) > 1;
});

const onDelete = () => {
  emit("onDelete", prop.product);
};
</script>
<template>
  <v-card class="position-relative">
    <v-card-text class="pb-0">
      <div class="product-grid-card-ribbon" v-if="isDiscount">Sale</div>
      <v-btn
        icon="ph-trash ph-1x"
        color="danger"
        variant="tonal"
        rounded
        size="x-small"
        class="product-grid-delete-btn"
        @click="onDelete"
      />
      <div class="pa-8">
        <v-img :src="product.img" hight="190" />
      </div>
      <div class="d-flex justify-space-between">
        <div>
          <span class="text-subtitle-1 font-weight-bold">
            ${{
              isDiscount
                ? (
                    product.price -
                    (product.price * product.discount) / 100
                  ).toFixed(2)
                : product.price
            }}
          </span>
          <span
            v-if="isDiscount"
            class="text-muted ms-1 text-decoration-line-through"
          >
            ${{ product.price }}
          </span>
        </div>
        <v-chip color="warning" size="small" rounded label>
          <i class="bx bxs-star" /> {{ product.ratings }}
        </v-chip>
      </div>
      <div class="text-subtitle-2 font-weight-bold text-truncate">
        {{ product.title }}
      </div>
      <div class="text-muted text-decoration-underline mt-1">
        {{ product.category }}
      </div>
    </v-card-text>
    <v-card-actions class="px-4 pb-4">
      <v-row no-gutters>
        <v-col cols class="mx-1">
          <v-btn
            variant="flat"
            block
            color="primary"
            to="/ecommerce/add-product"
          >
            <i class="ph-pencil mx-1"></i> Edit
          </v-btn>
        </v-col>
        <v-col cols class="mx-1">
          <v-btn
            block
            variant="flat"
            color="secondary"
            to="/ecommerce/product-details"
          >
            <i class="ph-eye mx-1"></i> Overview
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>
