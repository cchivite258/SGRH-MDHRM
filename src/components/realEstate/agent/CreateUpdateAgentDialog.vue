<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { AgentListingType } from "@/components/realEstate/agent/types";
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { statusOptions } from "@/components/realEstate/agent/utils";

const emit = defineEmits(["update:modelValue", "onSubmit"]);
const errorMsg = ref("");

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<AgentListingType>,
    required: true,
  },
});

const isCreate = prop.data.id === -1;
const formData = ref(prop.data);

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const img = ref(formData.value.img ? [formData.value.img] : []);
const name = ref(formData.value.name || "");
const location = ref(formData.value.location || "");
const email = ref(formData.value.email || "");
const contact = ref(formData.value.contact || "");
const status = ref(formData.value.status || "");

const onSubmit = () => {
  if (!img.value.length) {
    errorMsg.value = "Please enter image!";
  } else if (!name.value) {
    errorMsg.value = "Please enter agent name!";
  } else if (!location.value) {
    errorMsg.value = "Please enter location!";
  } else if (!email.value) {
    errorMsg.value = "Please enter email!";
  } else if (!contact.value) {
    errorMsg.value = "Please enter contact!";
  } else if (!status.value) {
    errorMsg.value = "Please select status!";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (
    !img.value.length ||
    !name.value ||
    !location.value ||
    !email.value ||
    !contact.value ||
    !status.value
  ) {
    return;
  }

  errorMsg.value = "";

  const data = {
    ...prop.data,
    img: img.value[0],
    name: name.value,
    location: location.value,
    email: email.value,
    contact: contact.value,
    status: status.value,
  };

  emit("onSubmit", data);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <Card
      :title="isCreate ? 'Add Agent' : 'Edit Agent'"
      title-class="py-0"
      style="overflow: hidden"
    >
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
      <v-card-text data-simplebar style="height: calc(100vh - 300px)">
        <div class="font-weight-bold text-caption mb-1">
          Agent Images <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <ImageUploader v-model="img" :multiple="false" />

        <div class="font-weight-bold text-caption mb-1">
          Agent Name <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="name" placeholder="Enter agent name" />

        <div class="font-weight-bold text-caption mb-1">
          Email <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="email" placeholder="Enter email" />

        <div class="font-weight-bold text-caption mb-1">
          Contact Number <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="contact" placeholder="Enter contact number" />

        <div class="font-weight-bold text-caption mb-1">
          Status <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <MenuSelect
          v-model="status"
          :items="statusOptions"
          placeholder="Select status"
        />
        <div class="font-weight-bold text-caption mb-1 mt-3">
          Address <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextArea v-model="location" placeholder="Enter address" />
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn color="danger" class="me-1">
            <i class="ph-x me-1" /> Close
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit">
            {{ isCreate ? "Add" : "Update" }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
