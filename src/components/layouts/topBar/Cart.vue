<script lang="ts" setup>
import { cartItems } from "@/components/layouts/utils";
import NumberSpinner from "@/app/common/components/NumberSpinner.vue";
import { CartItemType } from "@/components/layouts/types";
import ConfirmationDialog from "@/app/common/components/ConfirmationDialog.vue";
import { computed, watch, ref } from "vue";
import { DIR } from "@/app/const";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();

let cartItemsVar = ref<CartItemType[]>(cartItems);
let dialog = ref<boolean>(false);
let deleteCartItemId = ref<number>(0);

const getTotal = computed(() => {
  let total = 65;
  cartItemsVar.value.forEach((cartItem: CartItemType) => {
    total = total + cartItem.items * cartItem.price;
  });
  const discount = (total * 12.5) / 100;
  return total - discount;
});

const getDiscount = computed(() => {
  return (getTotal.value * 12.5) / 100;
});

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});

watch(dialog, (newValue: boolean) => {
  if (!newValue) {
    deleteCartItemId.value = 0;
  }
});

const removeProduct = (cartItem: CartItemType) => {
  deleteCartItemId.value = cartItem.id;
  dialog.value = true;
};

const onConfirm = () => {
  if (deleteCartItemId) {
    cartItemsVar.value = cartItemsVar.value.filter((item: CartItemType) => {
      return item.id !== deleteCartItemId.value;
    });
  }
  dialog.value = false;
};
</script>
<template>
  <v-menu :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn variant="text" v-bind="props" icon class="btn-ghost-dark">
        <v-badge
          :content="cartItemsVar.length"
          color="info"
          :location="isRtl ? 'left top' : 'end top'"
          offset-x="-3"
          offset-y="-6"
        >
          <i class="ph ph-handbag ph-2x"></i>
        </v-badge>
      </v-btn>
    </template>
    <v-card width="420">
      <v-card-title class="d-flex justify-space-between">
        <div>
          <span class="text-subtitle-2 font-weight-bold">My Cart</span>
          <v-badge inline :content="cartItemsVar.length" />
        </div>
        <v-btn variant="text" color="primary"> View All </v-btn>
      </v-card-title>
      <v-divider class="p-3 border-opacity-30" />
      <v-card-text data-simplebar style="max-height: 300px" class="px-6">
        <div
          v-if="cartItemsVar.length === 0"
          class="text-center empty-cart"
          id="empty-cart"
        >
          <v-avatar color="info" class="mb-2">
            <i class="bx bx-cart bx-sm"></i>
          </v-avatar>
          <h4 class="mb-5">Your Cart is Empty!</h4>
          <v-btn color="success" class="mb-3" elevation="0"> Shop Now </v-btn>
        </div>
        <div v-else>
          <v-row
            no-gutters
            v-for="(cartItem, index) in cartItemsVar"
            :key="index"
            class="mb-4 position-relative"
          >
            <v-col cols="auto">
              <div class="avatar-sm">
                <div class="avatar-title rounded">
                  <img :src="cartItem.src" class="avatar-xs" alt="user-pic" />
                </div>
              </div>
            </v-col>
            <v-col cols class="px-3">
              <p class="mb-1 cart-subtitle">{{ cartItem.subTitle }}</p>
              <v-btn
                icon
                variant="text"
                class="remove-cart-btn"
                color="primary"
                @click="removeProduct(cartItem)"
              >
                <i class="ph-x ph-1x" />
              </v-btn>
              <h6 class="mt-0 mb-3 text-subtitle-2 font-weight-bold mb-1">
                <div class="cart-title">
                  {{ cartItem.title }}
                </div>
              </h6>
              <v-row justify="space-between">
                <v-col cols="6" class="d-flex">
                  <NumberSpinner
                    v-model="cartItem.items"
                    @onAdd="cartItem.items < 100 && cartItem.items++"
                    @onReduce="cartItem.items > 0 && cartItem.items--"
                  />
                </v-col>
                <v-col cols="6" class="cart-price-total">
                  <h4 class="mb-0 font-weight-black">
                    $ {{ (cartItem.price * cartItem.items).toFixed(2) }}
                  </h4>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <h4 class="d-flex justify-space-between py-3">
            <div>Sub Total :</div>
            <div>$1306.52</div>
          </h4>
          <h4 class="d-flex justify-space-between py-3">
            <div>Shipping Charge :</div>
            <div>$65.00</div>
          </h4>
          <h4 class="d-flex justify-space-between py-3">
            <div>Estimated Tax (12.5%) :</div>
            <div>- ${{ getDiscount.toFixed(2) }}</div>
          </h4>
        </div>
      </v-card-text>
      <v-card-actions
        v-if="cartItemsVar.length"
        class="px-6 pb-4 border-dashed border d-flex flex-wrap"
        id="checkout-elem"
      >
        <h4 class="d-flex justify-space-between py-3 w-100">
          <div>Total:</div>
          <div>${{ getTotal.toFixed(2) }}</div>
        </h4>

        <v-btn block color="info" href="/ecommerce/checkout" variant="elevated">
          Checkout
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
  <ConfirmationDialog
    v-if="deleteCartItemId"
    v-model="dialog"
    @onConfirm="onConfirm"
  >
    <v-btn
      variant="text"
      class="confirm-close-icon"
      icon
      @click="dialog = false"
    >
      <i class="ph ph-x"></i>
    </v-btn>

    <v-card-text class="text-center ma-md-5">
      <div class="text-danger">
        <i class="ph ph-trash ph-4x"></i>
      </div>
      <div class="mt-4">
        <h4>Are you sure ?</h4>
        <p class="text-muted mx-4 mb-0">
          Are you sure you want to remove this product ?
        </p>
      </div>
    </v-card-text>
  </ConfirmationDialog>
</template>
