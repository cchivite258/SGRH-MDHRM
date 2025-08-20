<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/fileUpload/utils";
import FileUploader from "@/components/forms/fileUpload/index.vue";
</script>
<template>
  <Breadcrumb title="File Uploader" :items="breadcrumb" />
  <FileUploader />
</template>
