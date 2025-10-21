<script lang="ts" setup>
import { ref } from "vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { courseOptions } from "@/components/learning/courses/listView/utils";
import {
  levelOptions,
  languageOptions,
} from "@/components/learning/courses/createCourse/utils";
import CKEditor from "@/app/common/components/CKEditor.vue";

const editorId = "learning-course-description";
const emit = defineEmits(["onStepChange"]);
const title = ref("");
const category = ref([]);
const level = ref([]);
const languages = ref([]);
const lessons = ref("");
const price = ref("");
const discount = ref("");
const description = ref("");
const fullDescription = ref("");
</script>
<template>
  <Card title="Course details" elevation="0">
    <v-card-text>
      <div class="font-weight-medium text-caption mb-1">
        Course title
        <i class="ph-asterisk ph-xs text-danger" />
      </div>
      <TextField v-model="title" placeholder="Enter Course Title" />
      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-medium text-caption mb-1">
            Course Category
            <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <MenuSelect v-model="category" multiple :items="courseOptions" />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-medium text-caption mb-1">
            Courses Level
            <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <MenuSelect
            v-model="level"
            multiple
            :items="levelOptions"
            hide-details
          />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-medium text-caption mb-1">
            Language
            <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <MenuSelect
            v-model="languages"
            multiple
            :items="languageOptions"
            hide-details
          />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-medium text-caption mb-1">
            Lessons
            <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="lessons" placeholder="Lessons" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" lg="4">
          <div class="font-weight-medium text-caption mb-1">
            Course Price
            <i class="ph-asterisk ph-xs text-danger" />
          </div>

          <TextField v-model="price" placeholder="00.00">
            <template #prepend-inner>
              <i class="ph-currency-circle-dollar px-3" />
            </template>
          </TextField>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-medium text-caption mb-1">
            Discount Price
            <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="discount" placeholder="00">
            <template #prepend-inner>
              <i class="ph-percent px-3" />
            </template>
          </TextField>
        </v-col>
        <v-col cols="12" lg="4" class="align-center d-flex">
          <v-checkbox
            label="Enable this Discount"
            class="create-course-discount-checkbox"
            color="primary"
            hide-details
            density="compact"
          />
        </v-col>
      </v-row>
      <div class="font-weight-medium text-caption mb-1">
        Short Description
        <i class="ph-asterisk ph-xs text-danger" />
      </div>
      <TextArea v-model="description" placeholder="Enter description" />

      <div class="font-weight-medium text-caption mb-1">
        Add Description
        <i class="ph-asterisk ph-xs text-danger" />
      </div>

      <div class="ckeditor-wrapper">
        <div :id="editorId"></div>
        <CKEditor v-model="fullDescription" :id="editorId" />
      </div>
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
      <v-btn
        color="primary"
        variant="elevated"
        @click="emit('onStepChange', 2)"
      >
        Next Step <i class="ph-arrow-right ms-1" />
      </v-btn>
    </v-card-actions>
  </Card>
</template>
