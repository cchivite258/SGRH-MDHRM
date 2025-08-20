<script lang="ts" setup>
import { section3Data } from "@/components/pages/pricing/utils";
</script>
<template>
  <v-row justify="center">
    <v-col cols="12" lg="12">
      <div class="text-center mt-5 mb-15">
        <h5 class="text-h6 font-weight-bold">Our plans for your Business</h5>
        <div class="text-muted mt-1">
          Simple pricing. No hidden fees. Advanced features for you business.
        </div>
      </div>

      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="3"
          v-for="(item, index) in section3Data"
          :key="'section3Data-' + index"
        >
          <v-card>
            <v-progress-linear
              model-value="100"
              height="2"
              :color="item.color"
            />
            <div
              class="text-center py-1 bg-info-subtle text-info font-weight-bold"
              v-if="item.isPopular"
            >
              <i class="ph-lightning me-1" />
              Most Popular Choice
            </div>
            <v-card-text class="pa-8">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-1 font-weight-bold">
                  {{ item.title }}
                </div>
                <div>
                  <span class="text-h5 font-weight-bold">
                    {{ item.price }}
                  </span>
                  <span class="text-muted ms-2 font-weight-bold"
                    >/ Monthly</span
                  >
                </div>
              </div>
              <div class="text-muted mt-4">{{ item.description }}</div>
              <div>
                <div class="px-2 pt-2">
                  <div
                    v-for="(data, i) in item.details"
                    :key="'detail-' + i"
                    class="mt-3 pricing-detail-section"
                  >
                    <i class="bx bxs-badge-check text-success me-1" />
                    <span v-html="data" />
                  </div>
                </div>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                block
                variant="elevated"
                :color="item.isActivePlan ? 'danger' : 'info'"
                class="my-4"
              >
                {{ item.isActivePlan ? "Your Current Plan" : "Change Plan" }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
