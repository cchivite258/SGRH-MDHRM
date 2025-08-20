<script lang="ts" setup>
import ImageUploader from "@/app/common/components/ImageUploader.vue";
const emit = defineEmits(["onStepChange"]);
</script>
<template>
  <v-card-text>
    <div class="font-weight-bold text-subtitle-2 mb-1">Add image</div>
    <ImageUploader text="Drop product images here or click to upload." />

    <div class="font-weight-bold mb-2">Description</div>
    <TextArea hide-details />
  </v-card-text>
  <v-card-actions class="d-flex justify-space-between">
    <v-btn color="primary" variant="text" @click="emit('onStepChange', 1)">
      <i class="ph-arrow-left me-2" /> Back to General
    </v-btn>
    <v-btn color="success" variant="elevated" @click="emit('onStepChange', 3)">
      Submit <i class="ph-arrow-right ms-2" />
    </v-btn>
  </v-card-actions>
</template>
