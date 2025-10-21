<script lang="ts" setup>
import { computed, ref } from "vue";
import { addressType } from "@/components/eCommerce/checkout/utils";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    required: true,
  },
});

const isCreate = prop.data.id === -1;

const errorMsg = ref("");
const name = ref(prop.data.name);
const address = ref(prop.data.address);
const phone = ref(prop.data.phone);
const type = ref(prop.data.type);

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const onCreateEdit = () => {
  if (!name.value) {
    errorMsg.value = "Please enter name";
  } else if (!address.value) {
    errorMsg.value = "Please enter address";
  } else if (!phone.value) {
    errorMsg.value = "Please enter phone number";
  } else if (!type.value) {
    errorMsg.value = "Please select type";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (!name.value || !address.value || !phone.value || !type.value) {
    return;
  }

  errorMsg.value = "";
  const data = {
    ...prop.data,
    name: name.value,
    address: address.value,
    phone: phone.value,
    type: type.value,
  };

  emit("onCreateUpdate", data);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="600" scrollable>
    <Card :title="isCreate ? 'Add Address' : 'Edit Address'" title-class="py-0">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-alert
        v-if="errorMsg"
        :text="errorMsg"
        variant="tonal"
        color="danger"
        class="mx-5 mt-3"
        density="compact"
      />
      <v-card-text data-simplebar style="height: 450px">
        <h5 class="text-subtitle-2 pb-2">Name</h5>
        <TextField v-model="name" placeholder="Enter Name" />
        <h5 class="text-subtitle-2 pb-2">Address</h5>
        <TextArea v-model="address" placeholder="Enter address" />
        <h5 class="text-subtitle-2 pb-2">Phone</h5>
        <TextField v-model="phone" placeholder="Enter phone no." />
        <h5 class="text-subtitle-2 pb-2">Address Type</h5>
        <MenuSelect v-model="type" :items="addressType" />
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn
            class=""
            color="danger"
            variant="text"
            @click="dialogValue = false"
          >
            <i class="ph-x me-1" /> Close
          </v-btn>
          <v-btn
            class=""
            color="primary"
            variant="elevated"
            elevation="0"
            @click="onCreateEdit"
          >
            {{ isCreate ? "Add Address" : "Update" }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
