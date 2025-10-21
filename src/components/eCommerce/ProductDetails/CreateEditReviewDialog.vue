<script lang="ts" setup>
import { computed, ref } from "vue";
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import { ImageType } from "@/components/eCommerce/ProductDetails/types";

const emit = defineEmits(["update:modelValue", "onCreate", "onUpdate"]);
const errorMsg = ref("");

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  review: {
    type: Object,
    required: true,
  },
});

const isCreateReview = prop.review.id === -1;

const formData = ref(prop.review);
const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const description = ref(formData.value.desc);
const rating = ref(formData.value.rating);
const title = ref(formData.value.title);
const img = ref(formData.value.img);

const onCreateEdit = () => {
  if (!rating.value) {
    errorMsg.value = "Please enter a product ratings";
  } else if (!title.value) {
    errorMsg.value = "Please enter a product title";
  } else if (!description.value) {
    errorMsg.value = "Please enter a product review";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (!rating.value || !title.value || !description.value) {
    return;
  }
  const image = img.value?.map((image: ImageType, index: number) => {
    const { id, path, size, src } = image;
    return {
      src: src || "",
      path: path || "uploaded-img-" + index + ".png",
      size: size || "3000",
      id: id || index,
    };
  });

  const data = {
    ...prop.review,
    img: image,
    title: title.value,
    rating: rating.value,
    desc: description.value,
  };
  if (isCreateReview) {
    emit("onCreate", data);
  } else {
    emit("onUpdate", data);
  }
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="850" scrollable>
    <Card :title="isCreateReview ? 'Add Review' : 'Update Review'">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text data-simplebar style="max-height: 550px">
        <v-alert
          v-show="errorMsg"
          :text="errorMsg"
          variant="tonal"
          color="danger"
          density="compact"
          class="mb-3"
        />

        <div class="font-weight-bold text-subtitle-2 mb-1">
          Select Review
          <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <v-rating v-model="rating" density="compact" color="warning" />

        <div class="font-weight-bold text-subtitle-2 mb-1 mt-4">
          Review Title
          <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="title" placeholder="Title" />
        <div class="font-weight-bold text-subtitle-2 mb-1">
          Review
          <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextArea v-model="description" placeholder="Enter Review" />
        <div class="font-weight-bold text-subtitle-2 mb-1">Product Images</div>
        <ImageUploader v-model="img" />
      </v-card-text>
      <v-divider />

      <v-card-actions class="py-4 px-6">
        <v-spacer />
        <v-btn
          color="danger"
          class=""
          variant="text"
          density="compact"
          @click="dialogValue = false"
        >
          <i class="ph-x me-1" />
          Close
        </v-btn>
        <v-btn
          color="primary"
          class=""
          variant="elevated"
          elevation="0"
          @click="onCreateEdit"
        >
          {{ isCreateReview ? "Add Review" : "Update" }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
