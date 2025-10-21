<script lang="ts" setup>
import CKEditor from "@/app/common/components/CKEditor.vue";
const editorId = "product-description";
</script>
<template>
  <Card title="Ckeditor Classic Editor">
    <v-card-text>
      <div class="text-muted mb-2">
        Use <code>CKEditor</code> component for editor. It is common component
        for editor.
      </div>
      <div class="ckeditor-wrapper">
        <div :id="editorId"></div>
        <CKEditor :id="editorId" />
      </div>
    </v-card-text>
  </Card>
</template>
