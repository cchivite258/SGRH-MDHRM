<script lang="ts" setup>
import { ref } from "vue";
import { required, email, sameAs } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";

const isFormSubmitted = ref(false);

const states = [
  "Bihar",
  "Madhya Pradesh",
  "Maharashtra",
  "Andhra Pradesh",
  "Assam",
  "Chhattisgarh",
  "Gujarat",
  "Kerala",
  "Odisha",
  "Arunachal Pradesh",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Punjab",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
];

const formFieldRules = {
  formFields: {
    fname: { required },
    lname: { required },
    username: { required },
    city: { required },
    state: { required },
    zip: { required },
    isAgree: { required, sameAsRawValue: sameAs(true) },
  },
};
const formFields = ref({
  fname: "",
  lname: "",
  username: "",
  city: "",
  state: "Gujarat",
  zip: "",
  isAgree: false,
});
const v$ = useVuelidate(formFieldRules, { formFields });

const onSubmitForm1 = () => {
  isFormSubmitted.value = true;
  v$.value.$touch();
};
</script>
<template>
  <Card title="Custom Style">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="4">
          <div class="mb-1 font-weight-bold">First Name</div>
          <v-text-field
            v-model="formFields.fname"
            hide-details
            variant="solo"
            density="compact"
            class="text-field-component"
            placeholder="First Name"
            :class="{
              'is-invalid':
                isFormSubmitted && v$.formFields.fname.$errors.length,
              'is-valid':
                isFormSubmitted && !v$.formFields.fname.$errors.length,
            }"
          />
          <div
            v-if="isFormSubmitted && v$.formFields.fname.$invalid"
            class="invalid-feedback"
          >
            <span v-for="error in v$.formFields.fname.$errors">
              {{ error.$message }}
            </span>
          </div>
          <div
            v-if="isFormSubmitted && !v$.formFields.fname.$invalid"
            class="valid-feedback"
          >
            <span> Looks Good! </span>
          </div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="mb-1 font-weight-bold">Last Name</div>
          <v-text-field
            v-model="formFields.lname"
            hide-details
            variant="solo"
            density="compact"
            class="text-field-component"
            placeholder="Last Name"
            :class="{
              'is-invalid':
                isFormSubmitted && v$.formFields.lname.$errors.length,
              'is-valid':
                isFormSubmitted && !v$.formFields.lname.$errors.length,
            }"
          />
          <div
            v-if="isFormSubmitted && v$.formFields.lname.$invalid"
            class="invalid-feedback"
          >
            <span v-for="error in v$.formFields.lname.$errors">
              {{ error.$message }}
            </span>
          </div>
          <div
            v-if="isFormSubmitted && !v$.formFields.lname.$invalid"
            class="valid-feedback"
          >
            <span> Looks Good! </span>
          </div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="mb-1 font-weight-bold">Username</div>
          <v-text-field
            v-model="formFields.username"
            hide-details
            variant="solo"
            density="compact"
            class="text-field-component"
            placeholder="Username"
            :class="{
              'is-invalid':
                isFormSubmitted && v$.formFields.username.$errors.length,
              'is-valid':
                isFormSubmitted && !v$.formFields.username.$errors.length,
            }"
          />
          <div
            v-if="isFormSubmitted && v$.formFields.username.$invalid"
            class="invalid-feedback"
          >
            <span v-for="error in v$.formFields.username.$errors">
              {{ error.$message }}
            </span>
          </div>
          <div
            v-if="isFormSubmitted && !v$.formFields.username.$invalid"
            class="valid-feedback"
          >
            <span> Looks Good! </span>
          </div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="mb-1 font-weight-bold">City</div>
          <v-text-field
            v-model="formFields.city"
            hide-details
            variant="solo"
            density="compact"
            class="text-field-component"
            placeholder="City"
            :class="{
              'is-invalid':
                isFormSubmitted && v$.formFields.city.$errors.length,
              'is-valid': isFormSubmitted && !v$.formFields.city.$errors.length,
            }"
          />
          <div
            v-if="isFormSubmitted && v$.formFields.city.$invalid"
            class="invalid-feedback"
          >
            <span v-for="error in v$.formFields.city.$errors">
              {{ error.$message }}
            </span>
          </div>
          <div
            v-if="isFormSubmitted && !v$.formFields.city.$invalid"
            class="valid-feedback"
          >
            <span> Looks Good! </span>
          </div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="mb-1 font-weight-bold">State</div>
          <v-select
            v-model="formFields.state"
            variant="outlined"
            :items="states"
            placeholder="Select your state"
            class="menu-select-filter"
            density="compact"
            hide-details
            :class="{
              'is-invalid':
                isFormSubmitted && v$.formFields.state.$errors.length,
              'is-valid':
                isFormSubmitted && !v$.formFields.state.$errors.length,
            }"
          />
          <div
            v-if="isFormSubmitted && v$.formFields.state.$invalid"
            class="invalid-feedback"
          >
            <span v-for="error in v$.formFields.state.$errors">
              {{ error.$message }}
            </span>
          </div>
          <div
            v-if="isFormSubmitted && !v$.formFields.state.$invalid"
            class="valid-feedback"
          >
            <span> Looks Good! </span>
          </div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="mb-1 font-weight-bold">Zip</div>
          <v-text-field
            v-model="formFields.zip"
            hide-details
            variant="solo"
            density="compact"
            class="text-field-component"
            placeholder="Zip"
            :class="{
              'is-invalid': isFormSubmitted && v$.formFields.zip.$errors.length,
              'is-valid': isFormSubmitted && !v$.formFields.zip.$errors.length,
            }"
          />
          <div
            v-if="isFormSubmitted && v$.formFields.zip.$invalid"
            class="invalid-feedback"
          >
            <span v-for="error in v$.formFields.zip.$errors">
              {{ error.$message }}
            </span>
          </div>
          <div
            v-if="isFormSubmitted && !v$.formFields.zip.$invalid"
            class="valid-feedback"
          >
            <span> Looks Good! </span>
          </div>
        </v-col>
      </v-row>
      <v-checkbox
        v-model="formFields.isAgree"
        density="compact"
        hide-details
        :class="{
          'is-invalid': isFormSubmitted && v$.formFields.isAgree.$errors.length,
          'is-valid': isFormSubmitted && !v$.formFields.isAgree.$errors.length,
        }"
      >
        <template #label>
          <span> Agree to terms and conditions </span>
        </template>
      </v-checkbox>
      <div
        v-if="isFormSubmitted && v$.formFields.isAgree.$invalid"
        class="invalid-feedback"
      >
        <span> Please Agree to terms and conditions </span>
      </div>

      <div
        v-if="isFormSubmitted && !v$.formFields.isAgree.$invalid"
        class="valid-feedback"
      >
        <span> Looks Good! </span>
      </div>

      <v-btn color="primary" class="mt-3" @click="onSubmitForm1">
        Submit
      </v-btn>
    </v-card-text>
  </Card>
</template>
