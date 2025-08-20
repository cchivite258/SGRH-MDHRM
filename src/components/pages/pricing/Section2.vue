<script lang="ts" setup>
import { section2Data } from "@/components/pages/pricing/utils";
</script>
<template>
  <v-row justify="center">
    <v-col cols="12" lg="12">
      <div class="text-center mt-5 mb-15">
        <h5 class="text-h6 font-weight-bold">Plans & Pricing</h5>
        <div class="text-muted mt-1">
          Simple pricing. No hidden fees. Advanced features for you business.
        </div>
      </div>

      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="3"
          v-for="(item, index) in section2Data"
          :key="'section2Data-' + index"
        >
          <v-card>
            <div class="pricing-popular-tag" v-if="item.isPopular">Popular</div>
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar
                  color="success"
                  variant="tonal"
                  rounded
                  class="me-3"
                  size="45"
                >
                  <i class="ph-paper-plane-tilt ph-lg" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ item.title }}
                  </div>
                  <div class="text-muted">{{ item.description }}</div>
                </div>
              </div>
              <div class="mt-5">
                <span class="text-h5 font-weight-bold"> {{ item.price }} </span>
                <span class="text-muted ms-2">/ Monthly</span>
                <v-btn
                  block
                  variant="elevated"
                  :color="item.isActivePlan ? 'secondary' : 'primary'"
                  class="my-4"
                >
                  {{ item.isActivePlan ? "Your Current Plan" : "Change Plan" }}
                </v-btn>
                <div class="px-2 pt-2">
                  <div
                    v-for="(data, i) in item.details"
                    :key="'detail-' + i"
                    class="mt-3 pricing-detail-section"
                  >
                    <i class="ph-check text-success me-3" />
                    <span v-html="data" />
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
