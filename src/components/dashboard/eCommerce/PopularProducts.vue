<script lang="ts">
import {
  Img1,
  Img2,
  Img3,
  Img4,
  Img5,
  Img6,
} from "@/assets/images/products/utils";
import PopularProductDialog from "@/components/dashboard/eCommerce/PopularProductDialog.vue";

export default {
  components: {
    PopularProductDialog,
  },
  data() {
    return {
      dialog: false,
      popularProducts: [
        {
          src: Img1,
          title: "Craft Women Black Sling Bag",
          ratings: 487,
          cart: 936,
          price: 15.99,
        },
        {
          src: Img2,
          title: "Unique Men's Wrist Watch",
          ratings: 452,
          cart: 1420,
          price: 84.99,
        },
        {
          src: Img3,
          title: "Twiala Floral Dress",
          ratings: 562,
          cart: 562,
          price: 149.99,
        },
        {
          src: Img4,
          title: "Tokyo Fancy Bomber Jacket",
          ratings: 644,
          cart: 1540,
          price: 245.0,
        },
        {
          src: Img5,
          title: "Aster Dress 2XL / Royal Blue",
          ratings: 841,
          cart: 985,
          price: 74.63,
        },
        {
          src: Img6,
          title: "Craft Women Black Sling Bag",
          ratings: 763,
          cart: 763,
          price: 245.74,
        },
      ],
    };
  },
  methods: {
    onDialogValueChange(newVal: boolean) {
      this.dialog = newVal;
    },
  },
};
</script>
<template>
  <Card title="Popular Products">
    <template #title-action>
      <ListMenu
        isSortBy
        :listItems="[
          'Today',
          'Yesterday',
          'Last 7 days',
          'Last 30 days',
          'This Month',
          'Last Month',
        ]"
      />
    </template>
    <v-card-text data-simplebar style="max-height: 385px">
      <v-container
        v-for="(product, index) in popularProducts"
        :key="'popular-product-' + index"
      >
        <v-row class="dashed-border">
          <v-col cols="auto">
            <v-avatar rounded="0" color="light" class="pa-2" size="large">
              <v-img :src="product.src" />
            </v-avatar>
          </v-col>
          <v-col class="d-flex justify-space-between">
            <div>
              <h5 class="text-subtitle-2 font-weight-bold mb-1">
                {{ product.title }}
              </h5>
              <div class="text-muted">
                <i class="ph-star align-baseline" /> {{ product.ratings }}
                <i class="ph-shopping-cart align-baseline" />
                {{ product.cart }}
              </div>
            </div>
            <div class="d-flex align-center">
              <span class="text-primary font-weight-bold text-subtitle-2"
                >${{ product.price }}</span
              >
              <v-btn
                color="secondary"
                min-width="27"
                height="27"
                class="mx-1 px-1"
                @click="dialog = true"
              >
                <i class="ph-arrow-right" />
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </Card>
  <PopularProductDialog
    :dialog="dialog"
    @onDialogValueChange="onDialogValueChange"
  />
</template>
