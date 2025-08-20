<script lang="ts" setup>
import { widgets } from "@/components/eCommerce/orderOverview/utils";
</script>
<template>
  <v-card>
    <v-card-text>
      <div class="d-flex justify-space-between">
        <div>
          <div class="text-muted">Order Number</div>
          <div class="font-weight-bold text-subtitle-2 mt-2">#TBS250001</div>
        </div>
        <div class="d-flex align-center">
          <div class="text-right">
            <div class="font-weight-bold text-subtitle-2">
              15 Feb, 2024 <i class="bx bx-calendar bx-xs mx-1" />
            </div>
            <div class="text-muted d-flex align-center justify-end mt-1">
              <span>08.54</span> <i class="ph-clock ph-lg mx-1" />
            </div>
          </div>
          <v-btn to="/invoices/overview" color="primary" class="mx-2">
            <i class="ph-download-simple mx-1" />
            Invoice
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>

  <v-row class="mt-5">
    <v-col
      cols="12"
      sm="6"
      lg="3"
      v-for="(widget, index) in widgets"
      :key="'order-overview-widget-' + index"
    >
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols>
              <h6 class="text-subtitle-1 font-weight-bold">
                {{ widget.title }}
              </h6>
              <div class="font-weight-bold mt-2 text-subtitle-2">
                {{ widget.subTitle }}
              </div>
              <div class="text-muted my-1">{{ widget.text1 }}</div>
              <div class="text-muted">{{ widget.text2 }}</div>
            </v-col>
            <v-col cols="auto">
              <v-avatar :color="widget.color" variant="tonal" rounded size="50">
                <v-img v-if="widget.src" :src="widget.src" class="ma-2" />
                <i v-else :class="widget.icon"></i>
              </v-avatar>
            </v-col>
          </v-row>
        </v-card-text>
        <v-progress-linear
          :model-value="100"
          :color="widget.color"
          :height="2"
          class="mt-1"
        />
      </v-card>
    </v-col>
  </v-row>
</template>
