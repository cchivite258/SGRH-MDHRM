<script lang="ts" setup>
import BasicInfo from "@/components/eCommerce/orderOverview/BasicInfo.vue";
import Listing from "@/components/eCommerce/orderOverview/Listing.vue";
import BarCode from "@/assets/images/barcode.vue";
import OrderStatus from "@/components/eCommerce/orderOverview/OrderStatus.vue";
</script>
<template>
  <BasicInfo />
  <v-row>
    <v-col cols="12" lg="9">
      <Listing />
    </v-col>
    <v-col cols="12" lg="3">
      <Card title="Total Order amount">
        <v-card-text>
          <v-row justify="space-between">
            <v-col>Sub Total </v-col>
            <v-col class="text-end">$2,272.95</v-col>
          </v-row>
          <v-row justify="space-between">
            <v-col>Discount <span class="text-muted">(STEEX30) :</span> </v-col>
            <v-col class="text-end">-$681.89</v-col>
          </v-row>
          <v-row justify="space-between">
            <v-col>Shipping Charge : </v-col>
            <v-col class="text-end">$49.99</v-col>
          </v-row>
          <v-row justify="space-between">
            <v-col>Estimated Tax : </v-col>
            <v-col class="text-end">$409.13</v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4">
          <v-row justify="space-between" class="font-weight-bold">
            <v-col>Total (USD) : </v-col>
            <v-col class="text-end">$2,050.18</v-col>
          </v-row>
        </v-card-actions>
      </Card>

      <Card title="Logistics Details" class="mt-4">
        <template #title-action>
          <v-btn density="compact" color="light" class="" elevation="0">
            <span class="font-weight-bold">Track order</span>
          </v-btn>
        </template>
        <v-divider />
        <v-card-text>
          <div class="d-flex justify-space-between">
            <span class="text-subtitle-1 font-weight-bold"> Themesbrand </span>
            <span class="text-muted font-weight-bold">ID: MFDS1400457854 </span>
          </div>
          <div class="text-muted">Scan barcode to track</div>
          <BarCode class="mt-3" style="height: 70px" />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>

  <OrderStatus class="mt-5" />
</template>
