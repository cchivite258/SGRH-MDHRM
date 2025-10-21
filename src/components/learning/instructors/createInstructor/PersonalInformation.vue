<script lang="ts" setup>
import { ref } from "vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import {
  skillOptions,
  languageOptions,
} from "@/components/learning/instructors/createInstructor/utils";

const date = ref(new Date());
const name = ref("");
const username = ref("");
const lastName = ref("");
const designation = ref("");
const email = ref("");
const phone = ref("");
const city = ref("");
const country = ref("");
const zioCode = ref("");
const skill = ref(["Marketing", "Management"]);
const language = ref(["English"]);
const website = ref("");
const description = ref("");
const term = ref("");
</script>
<template>
  <Card elevation="0" title="Personal Information">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="4">
          <p class="text-muted">
            Personal identification numbers: social security number (SSN),
            passport number, driver's license number, taxpayer identification
            number, patient identification number.
          </p>
        </v-col>
        <v-col cols="12" lg="8">
          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">
                First Name <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="name" placeholder="Enter First name" />
              <div class="font-weight-bold mb-2">
                Username <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="username" placeholder="Enter Username" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">
                Last Name <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="lastName" placeholder="Enter Last name" />
              <div class="font-weight-bold mb-2">
                Joining Date <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <VueDatePicker
                v-model="date"
                :teleport="true"
                :enable-time-picker="false"
              />
            </v-col>
          </v-row>
          <div class="font-weight-bold mb-2">
            Designation <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="designation" placeholder="Enter Designation" />

          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">
                Email <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="email" placeholder="Enter Email" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Phone number</div>
              <TextField v-model="phone" placeholder="Enter Phone number" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold mb-2">City</div>
              <TextField v-model="city" placeholder="Enter City" />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold mb-2">Country</div>
              <TextField v-model="country" placeholder="Enter Country" />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold mb-2">Zip Code</div>
              <TextField v-model="zioCode" placeholder="Enter Zip Code" />
            </v-col>
          </v-row>
          <div class="font-weight-bold mb-2">Featured Skills</div>
          <MenuSelect v-model="skill" multiple :items="skillOptions" />
          <v-row class="mt-3">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Language Knows</div>
              <MenuSelect
                v-model="language"
                multiple
                :items="languageOptions"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Website URL</div>
              <TextField v-model="website" placeholder="Enter Website URL" />
            </v-col>
          </v-row>

          <div class="font-weight-bold mb-2">Short Description</div>
          <TextArea
            v-model="description"
            placeholder="Must enter minimum of a 150 characters"
          />

          <v-switch v-model="term" density="compact">
            <template #label>
              <div>
                I agree with
                <span class="ms-2 text-primary text-decoration-underline">
                  Term & Conditions
                </span>
              </div>
            </template>
          </v-switch>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
