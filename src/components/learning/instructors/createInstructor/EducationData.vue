<script lang="ts" setup>
import { ref } from "vue";

const degree = ref("");
const school = ref("");
const description = ref("");
const firstYear = ref(new Date().getFullYear());
const secondYear = ref(null);

const emit = defineEmits(["onDelete"]);
const onDelete = () => {
  emit("onDelete");
};
</script>
<template>
  <div class="font-weight-bold mb-2">Degree Title</div>
  <TextField v-model="degree" placeholder="Degree Title" />

  <v-row>
    <v-col lg="6">
      <div class="font-weight-bold mb-2">University/School</div>
      <TextField v-model="school" placeholder="University/School" />
    </v-col>
    <v-col lg="6" class="d-flex align-center">
      <div class="d-md-flex align-center">
        <VueDatePicker v-model="firstYear" year-picker />
        <span class="mx-4"> To </span>
        <VueDatePicker v-model="secondYear" year-picker />
      </div>
    </v-col>
  </v-row>
  <div class="font-weight-bold mb-2">Description</div>
  <TextArea v-model="description" placeholder="Enter Description" />

  <div class="d-flex justify-end">
    <v-btn color="danger" @click="onDelete"> Delete </v-btn>
  </div>
</template>
