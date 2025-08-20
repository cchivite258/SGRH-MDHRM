<script lang="ts" setup>
import ImageUploader from "@/app/common/components/ImageUploader.vue";
const emit = defineEmits(["onStepChange"]);
</script>
<template>
  <v-card-text>
    <div class="font-weight-medium text-caption mb-1">
      Main Course Image
      <i class="ph-asterisk ph-xs text-danger" />
    </div>
    <ImageUploader text="Drop product images here or click to upload." />
    <div class="font-weight-medium text-caption mb-1">Video URL</div>

    <TextField placeholder="Enter URL" />
    <div class="font-weight-medium text-caption mb-1">
      Upload Video
      <i class="ph-asterisk ph-xs text-danger" />
    </div>
    <ImageUploader text="Drop video here or click to upload." />
  </v-card-text>
  <v-card-actions class="d-flex justify-space-between">
    <v-btn color="primary" variant="text" @click="emit('onStepChange', 1)">
      <i class="ph-arrow-left me-2" /> Back to Course Details
    </v-btn>
    <v-btn color="primary" variant="elevated" @click="emit('onStepChange', 3)">
      Submit <i class="ph-arrow-right ms-1" />
    </v-btn>
  </v-card-actions>
</template>
