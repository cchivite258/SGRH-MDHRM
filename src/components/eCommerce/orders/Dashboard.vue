<script lang="ts" setup>
import { dashboardData } from "@/components/eCommerce/orders/utils";
import SuccessChip from "@/app/common/components/SuccessChip.vue";
</script>
<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
      md
      v-for="(overview, index) in dashboardData"
      :key="'eCommerce-order-overview-' + index"
    >
      <v-card>
        <v-card-text>
          <div class="d-flex justify-space-between">
            <CountTo
              class="text-h6 font-weight-bold"
              :endVal="overview.amount"
            />
            <SuccessChip
              :isSuccess="overview.isSuccess"
              :percent="overview.percent"
              class="ecommerce-order-chi"
            />
          </div>
          <p class="text-muted mt-4 text-uppercase font-weight-medium">
            {{ overview.title }}
          </p>
        </v-card-text>

        <v-progress-linear
          :model-value="overview.progress"
          :color="overview.color"
          :height="3"
        />
      </v-card>
    </v-col>
  </v-row>
</template>
