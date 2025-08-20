<script lang="ts" setup>
import { reviews } from "@/components/eCommerce/sellersOverview/utils";
</script>
<template>
  <Card title="Customer Reviews">
    <v-card-text>
      <v-alert density="compact" color="warning" variant="tonal">
        <div class="d-flex align-center justify-space-between">
          <div>
            <v-rating
              density="compact"
              :model-value="4.8"
              half-increments
              hide-details
            />
          </div>
          <div class="font-weight-bold text-black">4.8 out of 5</div>
        </div>
      </v-alert>
      <div class="text-center my-2">
        <div class="text-muted">
          Total <span class="font-weight-medium">5.50k</span> reviews
        </div>
      </div>
      <v-row
        v-for="(review, index) in reviews"
        :key="'seller-review-' + index"
        class="d-flex align-center mb-1"
        no-gutters
      >
        <v-col cols="auto" class="font-weight-bold">{{ review.title }}</v-col>
        <v-col cols class="mx-2">
          <v-progress-linear
            :model-value="review.value / 100"
            :color="review.color"
            rounded
            class="w-100"
          />
        </v-col>
        <v-col cols="auto" class="font-weight-bold text-muted">{{
          review.value
        }}</v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
