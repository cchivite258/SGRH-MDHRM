<script lang="ts" setup>
import CKEditor from "@/app/common/components/CKEditor.vue";
const editorId = "product-description";
</script>
<template>
  <Card title="Description">
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
          <div class="ckeditor-wrapper">
            <div :id="editorId"></div>
            <CKEditor :id="editorId" />
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
