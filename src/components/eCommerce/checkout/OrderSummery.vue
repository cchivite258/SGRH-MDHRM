<script lang="ts" setup>
import { computed } from "vue";
import { cartItems } from "@/components/eCommerce/shopCart/utils";
import { cartItemHeader } from "@/components/eCommerce/checkout/utils";
import { useRouter } from "vue-router";
import Table from "@/app/common/components/Table.vue";
import { CartItemType } from "@/components/eCommerce/shopCart/types";

const router = useRouter();

const onClick = () => {
  router.push({ path: "/ecommerce/product-details" });
};

const subTotal = computed(() => {
  let count = 0;
  cartItems.forEach((item: CartItemType) => {
    count = count + item.price * item.quantity;
  });
  return count;
});

const discount = computed(() => {
  return ((subTotal.value * 30) / 100).toFixed(2);
});

const tax = computed(() => {
  return ((subTotal.value * 18) / 100).toFixed(2);
});

const finalTotal = computed(() => {
  const total =
    Number(subTotal.value) - Number(discount.value) + Number(tax.value) + 65;

  return total.toFixed(2);
});
</script>
<template>
  <Card title="Order Summery">
    <template #title-action>
      <v-chip
        color="success"
        rounded="sm"
        density="compact"
        class="font-weight-medium text-caption"
      >
        Valid Time: 05:00
      </v-chip>
    </template>
    <v-card-text>
      <Table :headerItems="cartItemHeader">
        <template #body>
          <tr
            v-for="(item, index) in cartItems"
            :key="'cart-item-' + index"
            height="90"
            style="cursor: pointer"
            @click="onClick"
          >
            <td>
              <div class="d-flex">
                <v-avatar size="70" class="bg-light pa-2" rounded="lg">
                  <v-img :src="item.src" />
                </v-avatar>
              </div>
            </td>
            <td>
              <div>
                <div class="font-weight-bold">{{ item.name }}</div>
                <div class="text-muted my-1 d-flex align-center">
                  {{ item.price }} <i class="ph-x mx-1" /> 0{{ item.quantity }}
                </div>
              </div>
            </td>

            <td class="font-weight-bold">
              ${{ (item.quantity * item.price).toFixed(2) }}
            </td>
          </tr>
        </template>
      </Table>

      <div class="px-4 mt-4">
        <v-row class="font-weight-bold" justify="space-between">
          <v-col cols="auto"> Sub Total: </v-col>
          <v-col cols="auto" class="text-right"> ${{ subTotal }} </v-col>
        </v-row>
        <v-row justify="space-between">
          <v-col cols="auto"> Discount <span>(STEEX30) </span>: </v-col>
          <v-col cols="auto" class="text-right"> - ${{ discount }} </v-col>
        </v-row>
        <v-row justify="space-between">
          <v-col cols="auto"> Shipping Charge: </v-col>
          <v-col cols="auto" class="text-right"> $65.00 </v-col>
        </v-row>
        <v-row justify="space-between">
          <v-col cols="auto"> Estimated Tax (18%): </v-col>
          <v-col cols="auto" class="text-right"> ${{ tax }} </v-col>
        </v-row>
        <v-divider class="my-4" />
        <v-row class="font-weight-bold" justify="space-between">
          <v-col cols="auto"> Total (USD) : </v-col>
          <v-col cols="auto" class="text-right"> ${{ finalTotal }} </v-col>
        </v-row>
      </div>
    </v-card-text>
  </Card>
</template>
