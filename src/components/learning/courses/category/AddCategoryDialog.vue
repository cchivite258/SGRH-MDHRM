<script lang="ts" setup>
import { computed, ref } from "vue";
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import { v4 as uuidv4 } from "uuid";

const emit = defineEmits(["update:modelValue", "onCreate"]);
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const title = ref("");
const courses = ref(0);
const img = ref<any>([]);
const errorMsg = ref("");

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);

    if(!dialog) {
      title.value = ''
      courses.value = 0
      img.value = []
    }
  },
});

const onCreate = () => {
  if (!title.value) {
    errorMsg.value = "Please enter title";
  } else if (!courses.value) {
    errorMsg.value = "Please enter courses";
  } else if (!img.value.length) {
    errorMsg.value = "Please enter img number";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (!title.value || !courses.value || !img.value.length) {
    return;
  }

  errorMsg.value = "";
  errorMsg.value = "";
  const data = {
    id: uuidv4(),
    title: title.value,
    courses: courses.value,
    img: img.value[0].src,
    backgroundColor: "primary-subtle",
  };
  emit("onCreate", data);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="500">
    <Card title="Add Category" title-class="bg-secondary py-3">
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
      <v-card-text>
        <div class="font-weight-bold mb-2">
          Category Image <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <ImageUploader v-model="img" :multiple="false" />

        <div class="font-weight-bold mb-2">
          Category title <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="title" placeholder="Enter category title" />
        <div class="font-weight-bold mb-2">
          Courses count <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField
          v-model="courses"
          placeholder="Enter Courses count"
          hide-details
          type="number"
        />
      </v-card-text>
      <v-card-text class="d-flex justify-end">
        <v-btn variant="text" color="danger" @click="dialogValue = false">
          <i class="ph-x" /> Close
        </v-btn>
        <v-btn variant="elevated" color="primary" @click="onCreate">
          Add Category</v-btn
        >
      </v-card-text>
    </Card>
  </v-dialog>
</template>
