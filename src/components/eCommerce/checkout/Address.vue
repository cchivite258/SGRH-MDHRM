<script lang="ts" setup>
import { addresses } from "@/components/eCommerce/checkout/utils";
import { ref, watch } from "vue";
import CreateUpdateAddressDialog from "@/components/eCommerce/checkout/CreateUpdateAddressDialog.vue";
import { AddressType } from "@/components/eCommerce/checkout/types";
import { v4 as uuidv4 } from "uuid";
import ConfirmationDialog from "@/app/common/components/ConfirmationDialog.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
const addressDialog = ref(false);
const addressData = ref<AddressType | null>(null);
const confirmationDialog = ref(false);
const removeAddId = ref<string | null | number>(null);

const mappedAddress: AddressType[] = addresses.map((address) => {
  return {
    ...address,
    id: uuidv4(),
  };
});

const parserAddress = ref<AddressType[]>(mappedAddress);
const addressRef = ref("address1");

watch(addressDialog, (dialog: boolean) => {
  if (!dialog) {
    addressData.value = null;
  }
});

const onCreate = () => {
  addressData.value = {
    id: -1,
    name: "",
    address: "",
    phone: "",
    type: "",
    value: "",
  };
  addressDialog.value = true;
};

const onEdit = (address: AddressType) => {
  addressData.value = address;
  addressDialog.value = true;
};

const onCreateUpdate = (address: AddressType) => {
  if (address.id === -1) {
    parserAddress.value.push({
      ...address,
      id: uuidv4(),
      value: "address" + parserAddress.value.length + 1,
    });
  } else {
    parserAddress.value = parserAddress.value.map((item: AddressType) => {
      if (item.id === address.id) {
        return {
          ...item,
          ...address,
        };
      }
      return item;
    });
  }

  addressDialog.value = false;
};

const onRemove = (removeId: string | number) => {
  removeAddId.value = removeId;
  confirmationDialog.value = true;
};

const onConfirmDelete = () => {
  confirmationDialog.value = false;
  parserAddress.value = parserAddress.value.filter((item: AddressType) => {
    return item.id !== removeAddId.value;
  });
};
</script>
<template>
  <h5 class="text-subtitle-2 font-weight-bold pb-3">Choose Address</h5>
  <v-radio-group
    v-model="addressRef"
    color="primary"
    hide-details
    class="radio-group-wrapper"
  >
    <v-row>
      <v-col
        cols="12"
        sm="6"
        lg="4"
        v-for="address in parserAddress"
        :key="'shipping-address-' + address.value"
        class="position-relative radio-group-component-col"
      >
        <v-radio :value="address.value">
          <template #label>
            <v-card
              border
              elevation="0"
              class="w-100"
              :class="address.value === addressRef ? 'selected-radio-card' : ''"
            >
              <v-card-text>
                <div class="text-muted font-weight-bold text-uppercase">
                  {{
                    address.type === "home" ? "Home address" : "Office address"
                  }}
                </div>
                <div class="font-weight-bold text-subtitle-2 mt-3">
                  {{ address.name }}
                </div>
                <div class="text-muted">{{ address.address }}</div>
                <div class="text-muted">Mo. {{ address.phone }}</div>
              </v-card-text>
              <v-divider />
              <v-card-actions>
                <v-btn variant="text" class="" @click="onEdit(address)">
                  <i class="ph-pencil me-1" /> Edit</v-btn
                >
                <v-btn
                  v-if="address.id"
                  variant="text"
                  class=""
                  @click="onRemove(address.id)"
                >
                  <i class="ph-trash me-1" /> Remove</v-btn
                >
              </v-card-actions>
            </v-card>
          </template>
        </v-radio>
      </v-col>
      <v-col cols="12" sm="6" lg="4">
        <v-card
          border
          class="h-100 d-flex justify-center align-center flex-column"
          style="min-height: 180px"
          elevation="0"
          @click="onCreate"
        >
          <div class="d-flex flex-column align-center">
            <i class="ph-plus-circle mb-2 ph-xl" />
            <span class="text-primary font-weight-bold">Add Address</span>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-radio-group>
  <CreateUpdateAddressDialog
    v-if="addressData"
    v-model="addressDialog"
    :data="addressData"
    @onCreateUpdate="onCreateUpdate"
  />

  <RemoveItemConfirmationDialog
    v-model="confirmationDialog"
    @onConfirm="onConfirmDelete"
  />
</template>
