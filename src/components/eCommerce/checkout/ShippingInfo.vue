<script lang="ts" setup>
import ShippingMethod from "@/components/eCommerce/checkout/ShippingMethod.vue";
import Address from "@/components/eCommerce/checkout/Address.vue";
</script>
<template>
  <Card title="Shopping Information">
    <v-card-text class="shipping-information-wrapper">
      <Address />
      <div class="mt-5" />
      <ShippingMethod />
    </v-card-text>
  </Card>
</template>
