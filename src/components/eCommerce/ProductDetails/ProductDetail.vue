<script lang="ts" setup>
import {
  productSize,
  productColors,
  productOverview,
} from "@/components/eCommerce/ProductDetails/utils";
import { ref } from "vue";
const size = ref("2xl");
</script>
<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="8" class="pe-0">
          <v-card-title>
            <v-row justify="space-between">
              <v-col cols="9">
                <h5 class="text-h6 font-weight-bold text-truncate">
                  Unite Wear Solid Men Hooded Neck Blue T-Shirt
                </h5>
              </v-col>
              <v-col cols="3" class="text-right">
                <v-btn variant="text" color="primary" class="">
                  <i class="ph-storefront me-1" /> Visit Store
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <div class="d-flex">
              <div>
                <span class="font-weight-bold"> 3.7k </span>
                <span class="text-muted"> Sold </span>
              </div>
              <v-divider vertical class="mx-3" />
              <div>
                <span class="font-weight-bold"> 3.5k </span>
                <span class="text-muted"> Reviews </span>
              </div>
              <v-divider vertical class="mx-3" />
              <div>
                <span class="text-muted"> Published: </span>
                <span class="font-weight-bold"> 26 Mar, 2023 </span>
              </div>
            </div>
            <div class="text-subtitle-2 font-weight-bold my-4">
              Choose Size:
            </div>
            <v-tooltip
              v-for="item in productSize"
              :key="item.size"
              :text="item.tooltip"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  :variant="item.size === size ? 'elevated' : 'tonal'"
                  color="primary"
                  elevation="0"
                  size="x-small"
                  class="me-3"
                  @click="!item.disabled && (size = item.size)"
                >
                  {{ item.size }}
                </v-btn>
              </template>
            </v-tooltip>
            <div class="text-subtitle-2 font-weight-bold mt-6 mb-4">
              Colors:
            </div>
            <v-tooltip
              v-for="item in productColors"
              :key="item.color"
              :text="item.tooltip"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  :color="item.color"
                  size="small"
                  class="me-3"
                  icon
                  density="compact"
                  variant="elevated"
                />
              </template>
            </v-tooltip>
            <div class="text-subtitle-2 font-weight-bold mt-6 mb-2">
              Shipping Information:
            </div>

            <div class="text-muted font-weight-bold mb-1">
              Delivery Location
            </div>
            <div class="text-muted">
              A thicker knit T-Shirt with a rag cut edge and sleeves and a
              printed muscle man on the back, you will feel #ULTRA in one of
              these.
            </div>
          </v-card-text>
        </v-col>
        <v-divider vertical />
        <v-col cols>
          <v-card color="primary" elevation="0">
            <v-card-text>
              <v-row>
                <v-col>
                  <div class="text-subtitle-1 font-weight-bold">25% off</div>
                  <div class="text-white-50">If order over $120</div>
                </v-col>
                <v-col>
                  <v-btn color="black" elevation="0" class="">
                    Util 10 Feb, 2026
                  </v-btn></v-col
                >
              </v-row>
            </v-card-text>
          </v-card>
          <v-row class="mt-1">
            <v-col
              cols="12"
              sm="6"
              v-for="(item, index) in productOverview"
              :key="'product-overview-' + index"
            >
              <v-card class="text-center" border elevation="0">
                <v-card-text class="pa-2">
                  <div class="text-muted">{{ item.title }}</div>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ item.value }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols class="pe-1">
              <v-btn color="primary" block elevation="0" class="">Edit</v-btn>
            </v-col>
            <v-col cols class="ps-1">
              <v-btn color="danger" block elevation="0" class="">
                <i class="ph-trash" /> Delete</v-btn
              >
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
