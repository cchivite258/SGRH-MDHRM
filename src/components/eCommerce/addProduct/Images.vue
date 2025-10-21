<script lang="ts" setup>
import ImageUploader from "@/app/common/components/ImageUploader.vue";
</script>
<template>
  <Card title="Images">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="4">
          <p class="text-muted">
            Product Information refers to any information held by an
            organization about the products it produces, buys, sells or
            distributes.
          </p>
        </v-col>
        <v-col cols="12" lg="8">
          <div class="font-weight-bold mb-2">
            Product Images <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <ImageUploader text="Drop product images here or click to upload." />
          <div class="font-weight-bold mb-2">
            Gallery Images <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <ImageUploader text="Drop gallery images here or click to upload." />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
