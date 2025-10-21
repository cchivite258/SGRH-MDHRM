<script lang="ts" setup>
import { paymentInfo } from "@/components/eCommerce/checkout/utils";
import { ref } from "vue";
import PaymentDialog from "@/components/eCommerce/checkout/PaymentDialog.vue";
const selected = ref("masterCard");
const dialog = ref(false);
</script>
<template>
  <Card title="Payment Information">
    <template #title-action>
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <v-btn
            v-bind="props"
            class=""
            color="info"
            elevation="0"
            :variant="isHovering ? 'elevated' : 'tonal'"
            @click="dialog = true"
          >
            <i class="ph-plus-circle me-1" /> Add Card
          </v-btn>
        </template>
      </v-hover>
    </template>
    <v-card-text>
      <v-radio-group
        v-model="selected"
        color="primary"
        hide-details
        class="radio-group-wrapper"
      >
        <v-row>
          <v-col
            cols="12"
            lg="4"
            v-for="(payment, index) in paymentInfo"
            :key="'payment-info-' + index"
            class="position-relative radio-group-component-col"
          >
            <v-radio :value="payment.value">
              <template #label>
                <v-card
                  :color="payment.color"
                  class="w-100"
                  rounded="lg"
                  :class="
                    payment.value === selected ? 'selected-radio-card' : ''
                  "
                >
                  <v-card-text>
                    <i class="ph-currency-circle-dollar payment-card-icon" />
                    <i class="ph-wifi-medium text-white payment-card-icon" />
                    <span class="d-flex align-items-center mb-8">
                      <v-avatar size="40">
                        <v-img :src="payment.src" />
                      </v-avatar>
                    </span>
                    <span class="font-weight-bold text-h6 mb-2 d-block"
                      >9873 6548 9871 0123</span
                    >
                    <span class="d-flex align-items-center">
                      <span class="text-caption d-block">{{
                        payment.name
                      }}</span>
                      <span class="d-block ms-auto"
                        >Valid <b>{{ payment.valid }}</b></span
                      >
                    </span>
                  </v-card-text>
                </v-card>
              </template>
            </v-radio>
          </v-col>
        </v-row>
      </v-radio-group>
    </v-card-text>
  </Card>

  <PaymentDialog v-model="dialog" />
</template>
