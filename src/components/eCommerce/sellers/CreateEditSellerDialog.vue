<script lang="ts" setup>
import { computed, ref } from "vue";
import ImageUploader from "@/app/common/components/ImageUploader.vue";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  selectedSeller: {
    type: Object,
    required: true,
  },
});

const sellerData = ref(prop.selectedSeller);
const errorMsg = ref("");

const isCreate = sellerData.value?.id === -1;

const img = ref(sellerData.value?.img ? [sellerData.value?.img] : []);
const name = ref(sellerData.value?.name || "");
const seller = ref(sellerData.value?.seller || "");
const email = ref(sellerData.value?.email || "");
const phone = ref(sellerData.value?.phone || "");

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const onSubmit = () => {
  if (!img.value) {
    errorMsg.value = "Please upload logo";
  } else if (!name.value) {
    errorMsg.value = "Please enter owner name";
  } else if (!seller.value) {
    errorMsg.value = "Please enter seller name";
  } else if (!email.value) {
    errorMsg.value = "Please enter email";
  } else if (!phone.value) {
    errorMsg.value = "Please enter phone";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (
    !img.value.length ||
    !name.value ||
    !seller.value ||
    !email.value ||
    !phone.value
  ) {
    return;
  }

  errorMsg.value = "";

  const data = {
    ...prop.selectedSeller,
    img: img.value[0],
    name: name.value,
    seller: seller.value,
    email: email.value,
    phone: phone.value,
  };
  emit("onCreateUpdate", data);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <Card :title="isCreate ? 'Add Seller' : 'Update'" title-class="py-0">
      <template #title-action>
        <v-btn
          icon="ph-x"
          variant-plain
          elevation="0"
          @click="dialogValue = false"
        />
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
      <v-card-text data-simplebar style="max-height: 550px">
        <div class="font-weight-bold mb-2">
          Sellers Logo <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <ImageUploader v-model="img" :multiple="false" />

        <div class="font-weight-bold mb-2">
          Sellers Name <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="seller" placeholder="Enter Seller name" />

        <div class="font-weight-bold mb-2">
          Owner Name <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="name" placeholder="Enter owner name" />

        <div class="font-weight-bold mb-2">
          Email <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="email" isEmail placeholder="Enter email" />

        <div class="font-weight-bold mb-2">
          Phone <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="phone" placeholder="Enter phone number" />
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex justify-end pe-5 pb-3">
        <div>
          <v-btn
            color="danger"
            elevation="0"
            variant="text"
            class=""
            @click="dialogValue = false"
          >
            <i class="ph-x me-1" />Close
          </v-btn>
          <v-btn
            color="primary"
            elevation="0"
            variant="elevated"
            class=""
            @click="onSubmit"
          >
            {{ isCreate ? "Add" : "Update" }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
