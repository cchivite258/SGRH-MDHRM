<script lang="ts" setup>
import { invoiceOverview } from "@/components/invoice/list/utils";
import SuccessChip from "@/app/common/components/SuccessChip.vue";
</script>
<template>
  <v-row>
    <v-col cols="12" lg="7">
      <v-card>
        <v-card-text class="d-flex pa-6">
          <v-row>
            <v-col
              cols="12"
              sm="6"
              lg="3"
              v-for="(item, index) in invoiceOverview"
              :key="'invoice-list-' + index"
              class="ps-10"
              :class="index < invoiceOverview.length - 1 ? 'right-border' : ''"
            >
              <v-avatar
                :color="item.color"
                density="compact"
                variant="outlined"
                class="me-2"
              >
                <i :class="item.icon" />
              </v-avatar>
              <span class="text-muted"> {{ item.title }} </span>
              <div class="mt-3">
                <CountTo
                  :endVal="item.endVal"
                  class="text-h6 font-weight-bold me-4"
                />
                <SuccessChip
                  :isSuccess="item.isProgress"
                  :percent="item.percent"
                />
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" lg="5">
      <v-card class="h-100">
        <v-card-title class="d-flex justify-space-between">
          <div>
            <span class="text-subtitle-1 font-weight-bold"
              >Total Receivables
            </span>
            <v-tooltip
              location="top"
              width="250"
              class="text-center"
              text="Once you send an invoice (or bill), it becomes part of your accounts receivable – until it's paid."
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  density="compact"
                  v-bind="props"
                  icon="ph-warning-circle"
                />
              </template>
            </v-tooltip>
          </div>
          <div>
            <v-btn
              color="primary"
              variant="text"
              to="/ecommerce/seller-overview"
            >
              View Profile <i class="ph-arrow-right"
            /></v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <p class="text-muted mb-0"><b>$985.32k</b> Total unpaid invoices</p>
          <v-progress-linear
            model-value="75"
            color="primary"
            height="10"
            rounded
            class="mt-4"
            striped
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
