<script lang="ts" setup>
import {
  shippingMethod,
  addresses,
} from "@/components/eCommerce/checkout/utils";
import { ref } from "vue";

const shippingMethodRef = ref("free");
</script>
<template>
  <h5 class="text-subtitle-2 pb-3">Shipping Method</h5>
  <v-radio-group
    v-model="shippingMethodRef"
    color="primary"
    hide-details
    class="radio-group-wrapper"
  >
    <v-row>
      <v-col
        cols="12"
        lg="6"
        v-for="method in shippingMethod"
        :key="'shipping-method-' + method.value"
        class="position-relative radio-group-component-col"
      >
        <v-radio :value="method.value">
          <template #label>
            <v-card
              border
              elevation="0"
              class="w-100"
              :class="
                method.value === shippingMethodRef ? 'selected-radio-card' : ''
              "
            >
              <v-card-text class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <v-avatar class="bg-light me-2" rounded size="50">
                    <i :class="method.icon" />
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-2 font-weight-bold">
                      {{ method.title }}
                    </div>
                    <div class="text-muted">{{ method.subtitle }}</div>
                  </div>
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ method.price }}
                </div>
              </v-card-text>
            </v-card>
          </template>
        </v-radio>
      </v-col>
    </v-row>
  </v-radio-group>
</template>
