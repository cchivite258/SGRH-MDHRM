<script lang="ts" setup>
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import { type PropType, ref, computed } from "vue";
import { AgenciesListViewType } from "@/components/realEstate/agencies/listView/types";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<AgenciesListViewType>,
    required: true,
  },
});

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const errorMsg = ref("");

const formData = ref(prop.data);
const img = ref(formData.value.img ? [formData.value.img] : []);
const name = ref(formData.value.name || "");
const sinceDate = ref(formData.value.since || new Date());
const property = ref(formData.value.property || "");
const employee = ref(formData.value.employee || "");
const email = ref(formData.value.email || "");
const contact = ref(formData.value.contact || "");
const location = ref(formData.value.location || "");

const onCreateEdit = () => {
  if (!img.value.length) {
    errorMsg.value = "Please upload image!";
  } else if (!name.value) {
    errorMsg.value = "Please enter name";
  } else if (!sinceDate.value) {
    errorMsg.value = "Please select year ";
  } else if (!property.value) {
    errorMsg.value = "Please enter property";
  } else if (!employee.value) {
    errorMsg.value = "Please enter employee";
  } else if (!email.value) {
    errorMsg.value = "Please enter email";
  } else if (!contact.value) {
    errorMsg.value = "Please enter contact";
  } else if (!location.value) {
    errorMsg.value = "Please enter location";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (
    !img.value.length ||
    !name.value ||
    !sinceDate.value ||
    !property.value ||
    !employee.value ||
    !email.value ||
    !contact.value ||
    !location.value
  ) {
    return;
  }

  errorMsg.value = "";
  const data = {
    ...prop.data,
    img: img.value[0],
    name: name.value,
    sinceDate: sinceDate.value,
    property: property.value,
    employee: employee.value,
    email: email.value,
    contact: contact.value,
    location: location.value,
  };
  emit("onCreateUpdate", data);
};
</script>
<template>
  <v-dialog width="550" v-model="dialogValue" scrollable persistent>
    <Card title="Add Agencies" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" density="compact" @click="dialogValue = false" />
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
      <v-card-text data-simplebar style="height: calc(100vh - 350px)">
        <div class="font-weight-bold mb-2">
          Agencies Images <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <ImageUploader v-model="img" />

        <div class="font-weight-bold mb-2">
          Agencies Name <i class="ph-asterisk ph-xs text-danger" />
        </div>

        <TextField v-model="name" placeholder="Enter Agencies name" />

        <div class="font-weight-bold mb-2">
          Since <i class="ph-asterisk ph-xs text-danger" />
        </div>

        <VueDatePicker
          v-model="sinceDate"
          :teleport="true"
          :enable-time-picker="false"
          :clearable="false"
        />
        <v-row class="mt-4">
          <v-col cols="12" lg="6" class="me-">
            <div class="font-weight-bold mb-2">
              Employee <i class="ph-asterisk ph-xs text-danger" />
            </div>

            <TextField
              hide-details
              v-model="property"
              placeholder="Enter Agencies name"
            />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              Employee <i class="ph-asterisk ph-xs text-danger" />
            </div>

            <TextField
              hide-details
              v-model="employee"
              placeholder="Enter Employee"
            />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              Email <i class="ph-asterisk ph-xs text-danger" />
            </div>

            <TextField v-model="email" placeholder="Enter Email" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              Contact No <i class="ph-asterisk ph-xs text-danger" />
            </div>

            <TextField v-model="contact" placeholder="Enter Contact No" />
          </v-col>
        </v-row>
        <div class="font-weight-bold mb-2">
          Address <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextArea v-model="location" placeholder="Enter Address" />
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" @click="dialogValue = false">
          <i class="ph-x me-1" /> Close
        </v-btn>
        <v-btn color="primary" variant="elevated" @click="onCreateEdit">
          Add
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
