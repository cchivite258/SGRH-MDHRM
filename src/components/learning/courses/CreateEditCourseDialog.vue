<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  courseOptions,
  statusOptions,
} from "@/components/learning/courses/listView/utils";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import ImageUploader from "@/app/common/components/ImageUploader.vue";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  courseDetail: {
    type: Object,
    default: () => {},
  },
});
const isEdit = prop.courseDetail?.id !== -1 || false;

const formData = ref(prop.courseDetail);
const img = ref(formData.value?.img ? [formData.value.img] : []);
const name = ref(formData.value?.name || "");
const category = ref(formData.value?.category || "");
const instructor = ref(formData.value?.instructor || "");
const lessons = ref(formData.value?.lessons || "");
const students = ref(formData.value?.students || "");
const duration = ref(formData.value?.duration || "");
const fees = ref(formData.value?.fees || "");
const status = ref(formData.value?.status || "");
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
  if (!img.value) {
    errorMsg.value = "Please enter image";
  } else if (!name.value) {
    errorMsg.value = "Please enter course name";
  } else if (!category.value) {
    errorMsg.value = "Please select category";
  } else if (!instructor.value) {
    errorMsg.value = "Please enter instructor";
  } else if (!lessons.value) {
    errorMsg.value = "Please enter lesson";
  } else if (!students.value) {
    errorMsg.value = "Please enter students";
  } else if (!duration.value) {
    errorMsg.value = "Please enter duration";
  } else if (!fees.value) {
    errorMsg.value = "Please enter fees";
  } else if (!status.value) {
    errorMsg.value = "Please select status";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (
    !img.value ||
    !name.value ||
    !category.value ||
    !instructor.value ||
    !lessons.value ||
    !students.value ||
    !duration.value ||
    !fees.value ||
    !status.value
  ) {
    return;
  }

  const data = {
    ...prop.courseDetail,
    img: img.value,
    name: name.value,
    category: category.value,
    instructor: instructor.value,
    lessons: lessons.value,
    students: students.value,
    duration: duration.value,
    fees: fees.value,
    status: status.value,
  };

  emit("onCreateUpdate", data);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="550" scrollable>
    <Card
      :title="!isEdit ? 'Add Course' : 'Update Course'"
      class=""
      title-class="py-2 bg-danger"
    >
      <template #title-action>
        <v-btn
          icon="ph-x"
          elevation="0"
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
      <v-card-text data-simplebar style="height: calc(100vh - 500px)">
        <div class="font-weight-bold mb-2">
          Course Image <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <ImageUploader :multiple="false" v-model="img" />

        <div class="font-weight-bold mb-2">
          Course title <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="name" placeholder="Enter course title" />
        <div class="font-weight-bold mb-2">
          Course Category <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <MenuSelect v-model="category" :items="courseOptions" />

        <v-row class="mt-3">
          <v-col cols>
            <div class="font-weight-bold mb-2">
              Instructor <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="instructor"
              placeholder="Enter Instructor name"
              hide-details
            />
          </v-col>
          <v-col cols>
            <div class="font-weight-bold mb-2">
              Lessons <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="lessons"
              placeholder="Enter Lessons"
              hide-details
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols>
            <div class="font-weight-bold mb-2">
              Students <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="students"
              placeholder="Enter Students name"
              hide-details
            />
          </v-col>
          <v-col cols>
            <div class="font-weight-bold mb-2">
              Duration Time <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="duration"
              placeholder="Enter Duration Time"
              hide-details
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols>
            <div class="font-weight-bold mb-2">
              Fees <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="fees" placeholder="0.00" hide-details>
              <template #prepend-inner>
                <i class="ph-currency-circle-dollar px-3" />
              </template>
            </TextField>
          </v-col>
          <v-col cols>
            <div class="font-weight-bold mb-2">
              Status <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="status" :items="statusOptions" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn color="danger" variant="text" @click="dialogValue = false">
            <i class="ph-x me-1" /> Close
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            elevation="0"
            @click="onCreateEdit"
          >
            {{ isEdit ? "Update" : "Add Course" }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
