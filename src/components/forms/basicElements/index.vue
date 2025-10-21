<script lang="ts" setup>
import ImageUploader from "@/app/common/components/ImageUploader.vue";
</script>
<template>
  <Card title="Input Example">
    <v-card-text>
      <div class="text-muted mb-4">
        Use <code>v-text-field</code> for <b>text input</b>,
        <code>VueDatePicker</code> component for <b>date input</b> and
        <code>v-textarea</code> for large text.
      </div>
      <v-row>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Basic Input</div>
          <v-text-field
            hide-details
            variant="solo"
            density="compact"
            class="text-field-component"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Input with label</div>
          <v-text-field
            hide-details
            variant="solo"
            density="compact"
            class="text-field-component"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Input with placeholder</div>
          <v-text-field
            hide-details
            variant="solo"
            density="compact"
            class="text-field-component"
            placeholder="Placeholder"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Input with placeholder</div>
          <v-text-field
            hide-details
            modelValue="input value"
            variant="solo"
            density="compact"
            class="text-field-component"
            placeholder="Placeholder"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Disabled plain text input</div>
          <v-text-field
            hide-details
            modelValue="disabled input"
            disabled
            variant="plain"
            density="compact"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Disabled plain text input</div>
          <v-text-field
            hide-details
            modelValue="disabled input"
            disabled
            variant="solo"
            density="compact"
            class="text-field-component"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Input with prepend icon</div>
          <v-text-field
            hide-details
            variant="solo"
            placeholder="example@gmail.com"
            density="compact"
            class="text-field-component"
          >
            <template #prepend-inner>
              <i class="ph-envelope pe-3" />
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Input with append icon</div>
          <v-text-field
            hide-details
            variant="solo"
            placeholder="example@gmail.com"
            density="compact"
            class="text-field-component"
          >
            <template #append-inner>
              <i class="ph-envelope" />
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Input Date</div>
          <VueDatePicker
            :teleport="true"
            placeholder="Select date"
            :enable-time-picker="false"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Input Time</div>
          <VueDatePicker
            :teleport="true"
            time-picker
            placeholder="Select time"
            :enable-time-picker="false"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Input password</div>
          <v-text-field
            hide-details
            variant="solo"
            density="compact"
            type="password"
            class="text-field-component"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Example Textarea</div>
          <v-textarea
            hide-details
            variant="solo"
            density="compact"
            class="text-field-component"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Hint text</div>
          <v-text-field
            variant="solo"
            density="compact"
            class="text-field-component"
            hint="Must be 8-20 characters long."
          />
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-1">Rounded Input</div>
          <v-text-field
            variant="solo"
            density="compact"
            rounded
            placeholder="Enter your name"
            class="text-field-component"
          />
        </v-col>
        <v-col cols="12" lg="3">
          <v-text-field
            variant="solo"
            hide-details
            placeholder="Enter your name"
            label="Floating Input"
            class="text-field-component"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="File Input" class="mt-4">
    <v-card-text>
      <div class="text-muted mb-4">
        Use <code>v-file-input</code> for <b>file input</b> and
        <code>ImageUploader</code> component for <b>custom use.</b>
      </div>
      <v-row>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-1">Default size</div>
          <v-file-input variant="solo" class="text-field-component" />
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-1">Comfortable size</div>
          <v-file-input
            density="comfortable"
            variant="solo"
            class="text-field-component"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-1">Compact size</div>
          <v-file-input
            density="compact"
            variant="solo"
            class="text-field-component"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-1">Accept multiple files</div>
          <v-file-input
            multiple
            density="compact"
            variant="solo"
            class="text-field-component"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-1">Disabled File input</div>
          <v-file-input
            disabled
            density="compact"
            variant="solo"
            class="text-field-component"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-1">Custom File input</div>
          <ImageUploader />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
