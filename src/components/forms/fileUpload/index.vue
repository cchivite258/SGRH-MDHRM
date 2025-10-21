<script lang="ts" setup>
import ImageUploader from "@/app/common/components/ImageUploader.vue";
</script>
<template>
  <Card title="File Uploader">
    <v-card-text>
      <div class="text-muted mb-4">
        Use <code>ImageUploader</code> custom component for uploading files. Use
        <code>multiple</code> prop for file uploading option. It have prop name
        <code>text</code> to change inside text of uploader.
      </div>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="mb-2 font-weight-bold">Multiple File Uploader</div>
          <ImageUploader text="Drop/Upload multiple files" />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="mb-2 font-weight-bold">Single File Uploader</div>
          <ImageUploader :multiple="false" />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
