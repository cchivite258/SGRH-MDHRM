<script lang="ts" setup>
import { computed, ref } from "vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import {
  orderProductOptions,
  orderDeliveryOptions,
  orderPaymentOptions,
} from "@/components/eCommerce/orders/utils";
import ImageUploader from "@/app/common/components/ImageUploader.vue";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  selectedOrder: {
    type: Object,
    required: true,
  },
});

const orderData = ref(prop.selectedOrder);
const errorMsg = ref("");

const customer = ref(orderData.value.customer);
const product = ref(orderData.value.product);
const order_date = ref(orderData.value.order_date);
const name = ref(orderData.value.name);
const pay_method = ref(orderData.value.pay_method);
const price = ref(orderData.value.price);
const delivery_status = ref(orderData.value.delivery_status);
const img = ref(orderData.value.img ? [orderData.value.img] : []);

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const onSubmit = () => {
  if (!customer.value) {
    errorMsg.value = "Please enter a customer name";
  } else if (!product.value) {
    errorMsg.value = "Please enter a product";
  } else if (!order_date.value) {
    errorMsg.value = "Please enter a order date";
  } else if (!name.value) {
    errorMsg.value = "Please enter a shop name";
  } else if (!pay_method.value) {
    errorMsg.value = "Please select payment method";
  } else if (!price.value) {
    errorMsg.value = "Please enter amount";
  } else if (!img.value.length) {
    errorMsg.value = "Please enter product logo";
  } else if (!delivery_status.value.length) {
    errorMsg.value = "Please select delivery status";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (
    !customer.value ||
    !product.value ||
    !order_date.value ||
    !name.value ||
    !pay_method.value ||
    !price.value ||
    !delivery_status.value ||
    !img.value.length
  ) {
    return;
  }

  errorMsg.value = "";

  const data = {
    ...prop.selectedOrder,
    customer: customer.value,
    product: product.value,
    order_date: order_date.value,
    name: name.value,
    pay_method: pay_method.value,
    price: price.value,
    delivery_status: delivery_status.value,
    img: img.value[0],
  };
  emit("onCreateUpdate", data);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="600" scrollable>
    <Card title="Add Order" titleClass="bg-light">
      <template #title-action>
        <v-btn
          icon="ph-x"
          density="compact"
          variant="plain"
          @click="dialogValue = false"
        />
      </template>
      <v-alert
        v-if="errorMsg"
        :text="errorMsg"
        variant="tonal"
        color="danger"
        class="mx-5 mt-3"
        density="compact"
      />
      <v-card-text data-simplebar style="max-height: 500px">
        <div class="font-weight-bold mb-2">Customer Name</div>
        <TextField v-model="customer" placeholder="Enter Name" />

        <div class="font-weight-bold mb-2">Product</div>
        <MenuSelect v-model="product" :items="orderProductOptions" />
        <v-row class="mt-2">
          <v-col cols>
            <div class="font-weight-bold mb-2">Order Date</div>
            <VueDatePicker
              v-model="order_date"
              :teleport="true"
              :enable-time-picker="false"
              :clearable="false"
            />
            <div class="font-weight-bold mb-2 mt-3">Shop</div>
            <TextField v-model="name" placeholder="Enter shop name" />
          </v-col>
          <v-col cols>
            <div class="font-weight-bold mb-2">Payment Method</div>
            <MenuSelect v-model="pay_method" :items="orderPaymentOptions" />

            <div class="font-weight-bold mb-2 mt-3">Amount</div>
            <TextField v-model="price" placeholder="Total Amount" />
          </v-col>
        </v-row>
        <div class="font-weight-bold mb-2">Shop Logo</div>
        <ImageUploader v-model="img" :multiple="false" />
        <div class="font-weight-bold mb-2">Delivery Status</div>
        <MenuSelect v-model="delivery_status" :items="orderDeliveryOptions" />
      </v-card-text>
      <v-card-actions class="d-flex justify-end pe-5 pb-3">
        <div>
          <v-btn
            color="light"
            elevation="0"
            variant="elevated"
            class=""
            @click="dialogValue = false"
          >
            Close
          </v-btn>
          <v-btn
            color="success"
            elevation="0"
            variant="elevated"
            class=""
            @click="onSubmit"
          >
            Add Order
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
