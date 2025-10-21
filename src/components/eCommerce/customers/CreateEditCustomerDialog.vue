<script lang="ts" setup>
import { computed, ref } from "vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { statusOptions } from "@/components/eCommerce/customers/utils";
import ImageUploader from "@/app/common/components/ImageUploader.vue";

const emit = defineEmits(["update:modelValue", "onConfirm"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  customerDetail: {
    type: Object,
    default: () => {},
  },
});

const isCreate = prop.customerDetail?.id === -1;

const name = ref(prop.customerDetail?.name || "");
const email = ref(prop.customerDetail?.email || "");
const phone = ref(prop.customerDetail?.phone || "");
const create_date = prop.customerDetail?.create_date
  ? ref(new Date(prop.customerDetail?.create_date))
  : ref(new Date());
const status = ref(prop.customerDetail?.status || "");
const img = ref(prop.customerDetail.img ? [prop.customerDetail.img] : []);

const errorMsg = ref("");

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
    errorMsg.value = "Enter customer name";
  } else if (!email.value) {
    errorMsg.value = "Enter Email";
  } else if (!phone.value) {
    errorMsg.value = "Enter contact number";
  } else if (!create_date.value) {
    errorMsg.value = "Select date";
  } else if (!status.value) {
    errorMsg.value = "Select status";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (
    !name.value ||
    !email.value ||
    !phone.value ||
    !create_date.value ||
    !status.value
  ) {
    return;
  }

  const data = {
    ...prop.customerDetail,
    name: name.value,
    email: email.value,
    phone: phone.value,
    create_date: create_date.value,
    status: status.value,
    img: img.value[0],
  };
  emit("onConfirm", data);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="600" persistent scrollable>
    <Card
      :title="isCreate ? 'Add Customer' : 'Update Customer'"
      title-class="bg-light"
    >
      <template #title-action>
        <v-btn
          icon="ph-x"
          variant="plain"
          density="compact"
          @click="dialogValue = false"
        />
      </template>
      <v-card-text data-simplebar style="max-height: calc(100vh - 400px)">
        <v-alert
          v-show="errorMsg"
          :text="errorMsg"
          variant="tonal"
          color="danger"
          density="compact"
          class="mb-3"
        />
        <div class="font-weight-bold mb-2">Customer Name</div>
        <TextField v-model="name" placeholder="Enter customer name" />
        <div class="font-weight-bold mb-2">Customer Profile</div>
        <ImageUploader
          text="Drop file here or click to upload."
          v-model="img"
          :multiple="false"
        />

        <div class="font-weight-bold mb-2">Email</div>
        <TextField v-model="email" placeholder="Enter Email" />
        <div class="font-weight-bold mb-2">Contact no.</div>
        <TextField v-model="phone" placeholder="Enter Contact no" />
        <div class="font-weight-bold mb-2">Joining Date</div>
        <VueDatePicker
          v-model="create_date"
          class="mb-4"
          :teleport="true"
          :enable-time-picker="false"
          :clearable="false"
        />
        <div class="font-weight-bold mb-2">Status</div>
        <MenuSelect v-model="status" :items="statusOptions" />
      </v-card-text>
      <v-card-actions class="d-flex justify-end px-5 pb-3">
        <v-btn
          class=""
          color="light"
          elevation="0"
          variant="elevated"
          @click="dialogValue = false"
        >
          Close
        </v-btn>
        <v-btn
          class=""
          color="success"
          elevation="0"
          variant="elevated"
          @click="onCreateEdit"
        >
          {{ isCreate ? "Add Customer" : "Update" }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
