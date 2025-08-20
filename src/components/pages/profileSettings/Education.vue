<script lang="ts" setup>
import { ref } from "vue";

const formData = ref({
  degree: "",
  university: "",
  startYear: "2009",
  endYear: "2020",
  description: "",
});
</script>
<template>
  <Card title="Education">
    <v-card-text>
      <div class="font-weight-bold mb-1">First Name</div>
      <TextField
        v-model="formData.degree"
        placeholder="Enter your Degree name"
      />

      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">University/School Name</div>
          <TextField
            v-model="formData.university"
            placeholder="Enter your University/School Name"
            hide-details
          />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Passed Years</div>
          <div class="d-flex align-center">
            <VueDatePicker v-model="formData.startYear" year-picker />
            <span class="mx-3"> To </span>
            <VueDatePicker v-model="formData.endYear" year-picker />
          </div>
        </v-col>
      </v-row>

      <div class="font-weight-bold mb-1 mt-4">Degree Description</div>
      <TextArea v-model="formData.degree" placeholder="Enter Description" />
      <div class="d-flex justify-end">
        <v-btn color="danger"> Delete </v-btn>
      </div>
    </v-card-text>
    <v-card-actions class="pa-4">
      <v-btn variant="elevated" color="secondary"> Update</v-btn>
      <v-btn variant="elevated" color="primary"> Add New</v-btn>
    </v-card-actions>
  </Card>
</template>
