<script lang="ts" setup>
import { ref, computed } from "vue";
import Table from "@/app/common/components/Table.vue";
import {
  cartItemHeader,
  cartItems,
} from "@/components/eCommerce/shopCart/utils";
import NumberSpinner from "@/app/common/components/NumberSpinner.vue";
import { CartItemType } from "@/components/eCommerce/shopCart/types";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "vue-router";
const router = useRouter();

const mappedData = cartItems.map((cartItem) => {
  return {
    ...cartItem,
    id: uuidv4(),
  };
});
const cartItemsVal = ref(mappedData);

const subTotal = computed(() => {
  let count = 0;
  cartItemsVal.value.forEach((item: CartItemType) => {
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

const onClick = () => {
  router.push({ path: "/ecommerce/product-details" });
};
</script>
<template>
  <div>
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-row no-gutters>
          <v-col cols="12" lg="9">
            <Card title="Shopping Cart" title-class="py-4">
              <template #title-action>
                <v-chip density="comfortable" label color="danger">
                  <span class="font-weight-medium">5 items</span>
                </v-chip>
              </template>
              <v-card-text class="position-relative pt-0">
                <Table :headerItems="cartItemHeader">
                  <template #body>
                    <tr
                      v-for="(item, index) in cartItemsVal"
                      :key="'cart-item-' + index"
                      height="90"
                    >
                      <td @click="onClick" class="curser-pointer">
                        <div class="d-flex">
                          <v-avatar
                            size="70"
                            class="bg-light pa-2 me-3"
                            rounded="lg"
                          >
                            <v-img :src="item.src" />
                          </v-avatar>
                          <div>
                            <div class="font-weight-bold">{{ item.name }}</div>
                            <div class="text-muted my-1">
                              {{ item.category }}
                            </div>
                            <div class="d-flex mt-2">
                              <div v-if="item.size" class="me-2">
                                <span class="text-muted">Size:</span>
                                {{ item.size }}
                              </div>
                              <div>
                                <span class="text-muted">Color:</span>
                                {{ item.color }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>${{ item.price }}</td>
                      <td>
                        <NumberSpinner
                          v-model="item.quantity"
                          @onAdd="item.quantity < 100 && item.quantity++"
                          @onReduce="item.quantity > 0 && item.quantity--"
                        />
                      </td>
                      <td class="font-weight-bold">
                        ${{ (item.quantity * item.price).toFixed(2) }}
                      </td>
                    </tr>
                  </template>
                </Table>
              </v-card-text>
            </Card>
          </v-col>
          <v-divider :vertical="$vuetify.display.mdAndUp" />
          <v-col cols="12" lg="3">
            <Card title="Order Summery" class="h-100">
              <v-card-text>
                <v-row class="font-weight-bold mt-1" justify="space-between">
                  <v-col cols="auto"> Sub Total: </v-col>
                  <v-col cols="auto" class="text-right">
                    ${{ subTotal }}
                  </v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col cols="auto"> Discount <span>(STEEX30) </span>: </v-col>
                  <v-col cols="auto" class="text-right">
                    - ${{ discount }}
                  </v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col cols="auto"> Shipping Charge: </v-col>
                  <v-col cols="auto" class="text-right"> $65.00 </v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col cols="auto"> Estimated Tax (18%): </v-col>
                  <v-col cols="auto" class="text-right"> ${{ tax }} </v-col>
                </v-row>
                <v-row class="font-weight-bold" justify="space-between">
                  <v-col cols="auto"> Total (USD) : </v-col>
                  <v-col cols="auto" class="text-right">
                    ${{ finalTotal }}
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="d-flex justify-end mt-3">
                <div>
                  <v-spacer />
                  <v-btn
                    color="secondary"
                    class=""
                    variant="elevated"
                    elevation="0"
                    to="/ecommerce/products-grid"
                  >
                    Continue Shopping
                  </v-btn>
                  <v-btn
                    color="primary"
                    class=""
                    variant="elevated"
                    elevation="0"
                    to="/ecommerce/checkout"
                  >
                    Checkout
                  </v-btn>
                </div>
              </v-card-actions>
            </Card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>
