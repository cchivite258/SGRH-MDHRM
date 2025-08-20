<script lang="ts" setup>
import PersonalInformation from "@/components/eCommerce/checkout/PersonalInformation.vue";
import OrderSummery from "@/components/eCommerce/checkout/OrderSummery.vue";
import AdditionalService from "@/components/eCommerce/checkout/AdditionalService.vue";
import ShippingInfo from "@/components/eCommerce/checkout/ShippingInfo.vue";
import PaymentInfo from "@/components/eCommerce/checkout/PaymentInfo.vue";
</script>
<template>
  <v-row>
    <v-col cols="12" lg="8">
      <v-alert variant="tonal" color="danger" closable density="comfortable">
        <i class="ph-shopping-cart ph-lg me-1"></i> Minimum order must be
        <b>$1800</b>. You need to add more products with total cost of
        <b>$300</b>
      </v-alert>

      <PersonalInformation class="mt-5" />
      <ShippingInfo class="mt-5" />
      <PaymentInfo class="mt-5" />
    </v-col>
    <v-col cols="12" lg="4">
      <OrderSummery />
      <AdditionalService class="mt-5" />
    </v-col>
  </v-row>
</template>
