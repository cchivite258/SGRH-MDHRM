<script lang="ts" setup>
import { computed } from "vue";
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { ImageUploaderType } from "@/app/common/types/imageUploader";

const emit = defineEmits(["update:modelValue"]);

const uploaderItem = ref<ImageUploaderType[]>([]);
const prop = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  text: {
    type: String,
    default: "Drop files here or click to upload.",
  },
  multiple: {
    type: Boolean,
    default: true,
  },
});

const files = computed({
  get() {
    const existingFiles: ImageUploaderType[] = prop.modelValue.map(
      (data: any, index) => {
        return {
          ...data,
          src: data && data.src ? data.src : data,
          name: (data && data.name) || `uploaded-img-` + index + ".png",
          size: (data && data.size) || 1024,
          id: (data && data.id) || uuidv4(),
        };
      }
    );
    uploaderItem.value = existingFiles;
    return existingFiles;
  },
  set(value: any) {
    const data = value.map((file: any) => {
      if (!file.id) {
        return {
          src: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          id: uuidv4(),
        };
      }

      return file;
    });
    if (prop.multiple) {
      uploaderItem.value = [...uploaderItem.value, ...data];
    } else {
      uploaderItem.value = data;
    }
    emit(
      "update:modelValue",
      uploaderItem.value.map((item: any) => {
        return item;
      })
    );
  },
});

const onRemove = (item: any) => {
  uploaderItem.value = uploaderItem.value.filter(
    (uploaded: any) => uploaded.id !== item.id
  );

  emit(
    "update:modelValue",
    uploaderItem.value.map((item: any) => item)
  );
};
</script>
<template>
  <div class="position-relative">
    <v-file-input
      v-model="files"
      :multiple="multiple"
      variant="plain"
      :clearable="false"
      prepend-icon=""
      class="file-uploader"
      :accept="'.png, .jpeg'"
    />

    <div class="file-uploader-content">
      <div class="text-center">
        <i class="ph-cloud-arrow-down ph-4x" />
      </div>
      <div class="text-subtitle-1 font-weight-bold text-center">
        {{ text }}
      </div>
    </div>
  </div>
  <div>
    <v-card
      v-for="(file, index) in uploaderItem"
      :key="'temp-img-' + index"
      class="border mb-3"
      elevation="0"
    >
      <v-card-text class="d-flex align-center justify-space-between">
        <div class="d-flex">
          <v-avatar rounded="lg" size="large" class="pa-2 mx-2" color="light">
            <v-img :src="file.src" />
          </v-avatar>
          <div class="d-flex flex-column">
            <span class="font-weight-bold">
              {{ file.name }}
            </span>
            <span> {{ Math.ceil(Number(file.size) / 1024) }} kb </span>
          </div>
        </div>
        <v-btn size="x-small" color="danger" @click="onRemove(file)">
          Delete
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>
