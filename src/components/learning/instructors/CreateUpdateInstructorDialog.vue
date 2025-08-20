<script lang="ts" setup>
import { type PropType, computed, ref } from "vue";
import { statusOptions } from "@/components/learning/instructors/listView/utils";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import { InstructorDataType } from "@/components/learning/instructors/types";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<InstructorDataType>,
    default: () => {},
  },
});

const formData = ref(prop.data);
const isCreate = formData.value.id === -1;
const errorMsg = ref("");

const name = ref(formData.value?.name || "");
const img = ref(formData.value?.img ? [formData.value?.img] : []);
const email = ref(formData.value?.email || "");
const total_course = ref(formData.value?.total_course || "");
const experience = ref(formData.value?.experience || "");
const students = ref(formData.value?.students || "");
const contact = ref(formData.value?.contact || "");
const status = ref(formData.value?.status || "");

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const onConfirm = () => {
  if (!img.value.length) {
    errorMsg.value = "Please enter img";
  } else if (!name.value) {
    errorMsg.value = "Please enter name";
  } else if (!email.value) {
    errorMsg.value = "Please enter email";
  } else if (!total_course.value) {
    errorMsg.value = "Please enter total course";
  } else if (!experience.value) {
    errorMsg.value = "Please enter experience";
  } else if (!contact.value) {
    errorMsg.value = "Please enter contact";
  } else if (!status.value) {
    errorMsg.value = "Please enter status";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (
    !img.value ||
    !name.value ||
    !email.value ||
    !total_course.value ||
    !experience.value ||
    !contact.value ||
    !status.value
  ) {
    return;
  }
  emit("onCreateUpdate", {
    ...prop.data,
    img: img.value,
    name: name.value,
    email: email.value,
    total_course: total_course.value,
    experience: experience.value,
    contact: contact.value,
    status: status.value,
    students: students.value,
  });
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="550" scrollable>
    <Card
      :title="isCreate ? 'Add Instructor' : 'Update Instructor'"
      title-class="py-2"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
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
          Instructor Image <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <ImageUploader v-model="img" :multiple="false" />

        <div class="font-weight-bold mb-2">
          Instructor Name <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="name" placeholder="Enter Instructor Name" />
        <div class="font-weight-bold mb-2">
          Email <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField isEmail v-model="email" placeholder="Enter Email" />
        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              Total Courses <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              type="number"
              v-model="total_course"
              placeholder="Total Courses"
            />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              Experience <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              type="number"
              v-model="experience"
              placeholder="Experience"
            />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">Students</div>
            <TextField
              type="number"
              v-model="students"
              placeholder="Students"
            />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              Contact no <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              type="number"
              v-model="contact"
              placeholder="Contact no"
            />
          </v-col>
        </v-row>
        <div class="font-weight-bold mb-2">
          Status <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <MenuSelect v-model="status" class="mb-4" :items="statusOptions" />
      </v-card-text>
      <v-card-actions class="d-fle justify-end">
        <v-btn color="danger" @click="dialogValue = false">
          <i class="ph-x me-1" /> Close
        </v-btn>
        <v-btn color="primary" variant="elevated" @click="onConfirm">
          {{ isCreate ? "Add Instructor" : "Update Instructor" }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
