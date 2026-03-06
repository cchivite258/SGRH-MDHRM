<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { AgentListingType } from "@/components/realEstate/agent/types";
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { statusOptions } from "@/components/realEstate/agent/utils";
import { useToast } from "vue-toastification";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";

const emit = defineEmits(["update:modelValue", "onSubmit"]);
const errorMsg = ref("");
const toast = useToast();

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
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

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

const requiredRules = {
  name: [(v: string) => !!v?.trim() || "Please enter agent name!"],
  location: [(v: string) => !!v?.trim() || "Please enter location!"],
  email: [(v: string) => !!v?.trim() || "Please enter email!"],
  contact: [(v: string) => !!v?.trim() || "Please enter contact!"],
  status: [(v: string) => !!v || "Please select status!"],
};

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error("Validation error");
    return;
  }

  if (!img.value.length) {
    toast.error("Please enter image!");
    errorMsg.value = "Please enter image!";
    setTimeout(() => {
      errorMsg.value = "";
    }, 3000);
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

  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    name: "trimToEmpty",
    location: "trimToEmpty",
    email: "trimToEmpty",
    contact: "trimToEmpty",
  });

  emit("onSubmit", data);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
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

          <div class="font-weight-bold text-caption mb-1 mt-2">
            Agent Name <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="name" placeholder="Enter agent name" :rules="requiredRules.name" />

          <div class="font-weight-bold text-caption mb-1">
            Email <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="email" placeholder="Enter email" :rules="requiredRules.email" />

          <div class="font-weight-bold text-caption mb-1">
            Contact Number <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="contact" placeholder="Enter contact number" :rules="requiredRules.contact" />

          <div class="font-weight-bold text-caption mb-1">
            Status <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <MenuSelect
            v-model="status"
            :items="statusOptions"
            placeholder="Select status"
            :rules="requiredRules.status"
          />

          <div class="font-weight-bold text-caption mb-1 mt-3">
            Address <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextArea v-model="location" placeholder="Enter address" :rules="requiredRules.location" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <div>
            <v-btn color="danger" class="me-1" @click="dialogValue = false">
              <i class="ph-x me-1" /> Close
            </v-btn>
            <v-btn color="primary" variant="elevated" @click="onSubmit">
              {{ isCreate ? "Add" : "Update" }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
