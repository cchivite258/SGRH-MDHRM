<script lang="ts" setup>
import { section4Data } from "@/components/pages/pricing/utils";
</script>
<template>
  <v-row justify="center">
    <v-col cols="12" lg="12">
      <div class="text-center mt-5 mb-15">
        <h5 class="text-h6 font-weight-bold">Simple Pricing Plan</h5>
        <div class="text-muted mt-1">
          Simple pricing. No hidden fees. Advanced features for you business.
        </div>
      </div>

      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="4"
          v-for="(item, index) in section4Data"
          :key="'section4Data-' + index"
        >
          <v-card>
            <v-row>
              <v-col cols="12" lg="5" :class="'bg-' + item.color + '-subtle'">
                <div class="pa-4 h-100 d-flex flex-column">
                  <div>
                    <div class="text-subtitle-1 font-weight-bold mb-1">
                      {{ item.title }}
                    </div>
                    <div>{{ item.description }}</div>
                  </div>
                  <div :class="'text-' + item.color" class="mt-auto">
                    <span class="text-h5 font-weight-bold">
                      {{ item.price }}
                    </span>
                    <span class="ms-2">/ per month</span>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" lg="7">
                <div v-if="item.isPopular" class="pricing-popular-tag-rounded">
                  Hot
                </div>
                <div class="pa-4">
                  <div
                    v-for="(data, i) in item.details"
                    :key="'detail-' + i"
                    class="mb-4"
                  >
                    <i
                      class="ph-check-square-offset me-2"
                      :class="'text-' + item.color"
                    />
                    <span v-html="data" />
                  </div>
                  <v-btn block :color="item.color" class="mt-5">
                    Buy Now
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
