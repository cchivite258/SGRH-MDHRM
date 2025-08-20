<script lang="ts" setup>
import { computed, ref, type PropType } from "vue";
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import {
  propertyTypes,
  requirementOptions,
} from "@/components/realEstate/grid/utils";
import { PropertyType } from "@/components/realEstate/types";
const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<PropertyType>,
    required: true,
  },
});

const formData = ref(prop.data);
const isCreate = formData.value.id === -1 || false;

const type = ref(formData.value.type || "");
const title = ref(formData.value.title || "");
const img = ref(formData.value.img ? [formData.value.img] : []);
const bedroom = ref(formData.value.bedroom || "");
const bathroom = ref(formData.value.bathroom || "");
const area = ref(formData.value.area || "");
const price = ref(formData.value.price || "");
const agent = ref(formData.value.agent || "");
const requirement = ref(formData.value.requirement || "");
const location = ref(formData.value.location || "");

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
  if (!type.value) {
    errorMsg.value = "Please enter property type";
  } else if (!title.value) {
    errorMsg.value = "Please enter title";
  } else if (!img.value.length) {
    errorMsg.value = "Please enter img";
  } else if (!bedroom.value) {
    errorMsg.value = "Please enter bedroom";
  } else if (!bathroom.value) {
    errorMsg.value = "Please enter bathroom";
  } else if (!area.value) {
    errorMsg.value = "Please enter area";
  } else if (!price.value) {
    errorMsg.value = "Please enter price";
  } else if (!agent.value) {
    errorMsg.value = "Please enter agent";
  } else if (!requirement.value) {
    errorMsg.value = "Please enter requirement";
  } else if (!location.value) {
    errorMsg.value = "Please enter location";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (
    !type.value ||
    !title.value ||
    !img.value.length ||
    !bedroom.value ||
    !bathroom.value ||
    !area.value ||
    !price.value ||
    !agent.value ||
    !requirement.value ||
    !location.value
  ) {
    return;
  }

  errorMsg.value = "";

  const data = {
    ...prop.data,
    type: type.value,
    title: title.value,
    img: img.value[0],
    bedroom: bedroom.value,
    bathroom: bathroom.value,
    area: area.value,
    price: price.value,
    agent: agent.value,
    requirement: requirement.value,
    location: location.value,
  };

  emit("onCreateUpdate", data);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="800" scrollable>
    <Card
      :title="isCreate ? 'Add Property List' : 'Update'"
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" @click="dialogValue = false" />
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
      <v-card-text data-simplebar style="height: calc(100vh - 200px)">
        <div class="font-weight-bold mb-2">
          Property Images <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <ImageUploader v-model="img" :multiple="false" />

        <div class="font-weight-bold mb-2">
          Property Title <i class="ph-asterisk ph-xs text-danger" />
        </div>

        <TextField v-model="title" placeholder="Enter Property title" />

        <div class="font-weight-bold mb-2">
          Property Type <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <MenuSelect v-model="type" :items="propertyTypes" />

        <v-row class="mt-2">
          <v-col sm="12" md="6" lg="4">
            <div class="font-weight-bold mb-2">
              Bedroom <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="bedroom"
              placeholder="Enter Bedroom"
              type="number"
            />
          </v-col>
          <v-col sm="12" md="6" lg="4">
            <div class="font-weight-bold mb-2">
              Bathroom <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="bathroom"
              placeholder="Enter Bathroom"
              type="number"
            />
          </v-col>
          <v-col sm="12" md="6" lg="4">
            <div class="font-weight-bold mb-2">
              SQFT <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="area" placeholder="Enter sqft" type="number" />
          </v-col>
          <v-col sm="12" md="6" lg="4">
            <div class="font-weight-bold mb-2">
              Price <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="price"
              placeholder="Enter Price"
              type="number"
            />
          </v-col>
          <v-col sm="12" md="6" lg="4">
            <div class="font-weight-bold mb-2">
              Agent Name <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="agent" placeholder="Enter Agent Name" />
          </v-col>
          <v-col sm="12" md="6" lg="4">
            <div class="font-weight-bold mb-2">
              Requirement <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="requirement" :items="requirementOptions" />
          </v-col>
        </v-row>
        <div class="font-weight-bold mb-2">
          Short Address <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextArea v-model="location" placeholder="Enter Short address" />
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn color="danger" @click="dialogValue = false">
            <i class="ph-x" /> Close
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onCreateEdit">
            {{ isCreate ? "Add" : "Update" }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
