<script lang="ts" setup>
import OrderMap from "@/components/eCommerce/orderOverview/OrderMap.vue";
</script>
<template>
  <Card title="Order Status">
    <template #title-action>
      <div>
        <v-btn density="comfortable" color="danger" class="px-2 mx-1">
          <i class="ph-x mx-1" />
          Cancel Order
        </v-btn>
        <v-btn
          density="comfortable"
          color="primary"
          class="px-2"
          to="/invoices/overview"
        >
          <i class="ph-download-simple mx-1" />
          Invoice
        </v-btn>
      </div>
    </template>
    <v-card-text>
      <v-row no-gutters class="position-relative">
        <v-col cols>
          <v-btn color="info" size="x-large" block rounded="0">
            <i class="ph-bag mx-1" />
            Order Placed
          </v-btn>
        </v-col>
        <v-col cols>
          <v-btn
            color="info"
            size="x-large"
            class="order-status-button"
            block
            rounded="0"
          >
            <i class="ph-package mx-1" />
            Packed
          </v-btn>
        </v-col>
        <v-col cols>
          <v-btn
            color="info"
            size="x-large"
            variant="tonal"
            class="order-status-button"
            block
            rounded="0"
          >
            <i class="ph-truck mx-1" />
            Shipping
          </v-btn>
        </v-col>
        <v-col cols>
          <v-btn
            size="x-large"
            class="order-status-button bg-primary-subtle"
            block
            rounded="0"
          >
            <div class="text-muted">
              <i class="ph-bicycle mx-1" />

              Out for Delivery
            </div>
          </v-btn>
        </v-col>
        <v-col cols>
          <v-btn
            size="x-large"
            class="order-status-button bg-primary-subtle"
            block
            rounded="0"
          >
            <div class="text-muted">
              <i class="ph-house mx-1" />
              Delivered
            </div>
          </v-btn>
        </v-col>
      </v-row>
      <OrderMap />
    </v-card-text>
  </Card>
</template>
