<script lang="ts" setup>
import { ref } from "vue";
const formGrid = ref({
  fName: "",
  lName: "",
  company: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "All",
});

const verticalForm = ref({
  fName: "",
  lName: "",
  company: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "All",
});

const horizontalForm = ref({
  fName: "",
  lName: "",
  company: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "All",
});

const fieldSizing = ref({
  default: "",
  comfortable: "",
  compact: "",
  floatDefault: "",
  floatComfortable: "",
  floatCompact: "",
});

const columnSizing = ref({
  fName: "",
  lName: "",
  email: "",
  password: "",
  confirmPassword: "",
  city: "",
  state: "",
  zip: "",
});

const inline = ref({ username: "", state: "", check: "" });
</script>
<template>
  <div class="text-muted mb-3">
    For input <code>TextField</code> and <code>TextArea</code> common components
    are used.
  </div>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Form Grid" class="h-100">
        <v-card-text>
          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">First Name</div>
              <TextField
                v-model="formGrid.fName"
                hide-details
                placeholder="Enter your first name"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Last Name</div>
              <TextField
                v-model="formGrid.lName"
                hide-details
                placeholder="Enter your last name"
              />
            </v-col>
            <v-col cols="12">
              <div class="font-weight-bold mb-2">Company Name</div>
              <TextField
                v-model="formGrid.company"
                hide-details
                placeholder="Enter your company name"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Phone Number</div>
              <TextField
                v-model="formGrid.phone"
                hide-details
                placeholder="Enter your phone number"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Email Address</div>
              <TextField
                v-model="formGrid.email"
                hide-details
                placeholder="example@gmail.com"
              />
            </v-col>
            <v-col cols="12">
              <div class="font-weight-bold mb-2">Address</div>
              <TextArea
                v-model="formGrid.address"
                hide-details
                placeholder="Enter your Address"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">City</div>
              <TextField
                v-model="formGrid.city"
                hide-details
                placeholder="Enter your city"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">State</div>
              <v-select
                v-model="formGrid.state"
                hide-details
                variant="outlined"
                density="compact"
                :items="['All']"
              />
            </v-col>
          </v-row>
          <div class="mt-4 d-flex justify-end">
            <v-btn color="primary"> Submit </v-btn>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Vertical Form" class="h-100">
        <v-card-text>
          <div class="font-weight-bold mb-2 mt-3">First Name</div>
          <TextField
            v-model="verticalForm.fName"
            hide-details
            placeholder="Enter your first name"
          />

          <div class="font-weight-bold mb-2 mt-3">Last Name</div>
          <TextField
            v-model="verticalForm.lName"
            hide-details
            placeholder="Enter your last name"
          />
          <div class="font-weight-bold mb-2 mt-3">Company Name</div>
          <TextField
            v-model="verticalForm.company"
            hide-details
            placeholder="Enter your company name"
          />

          <div class="font-weight-bold mb-2 mt-3">Phone Number</div>
          <TextField
            v-model="verticalForm.phone"
            hide-details
            placeholder="Enter your phone number"
          />

          <div class="font-weight-bold mb-2 mt-3">Email Address</div>
          <TextField
            v-model="verticalForm.email"
            hide-details
            placeholder="example@gmail.com"
          />

          <div class="font-weight-bold mb-2 mt-3">Address</div>
          <TextArea
            v-model="verticalForm.address"
            hide-details
            placeholder="Enter your Address"
          />

          <div class="font-weight-bold mb-2 mt-3">City</div>
          <TextField
            v-model="verticalForm.city"
            hide-details
            placeholder="Enter your city"
          />

          <div class="font-weight-bold mb-2 mt-3">State</div>
          <v-select
            v-model="verticalForm.state"
            hide-details
            variant="outlined"
            density="compact"
          />

          <div class="mt-4 d-flex justify-end">
            <v-btn color="primary"> Submit </v-btn>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Horizontal Form" class="h-100">
        <v-card-text>
          <v-row>
            <v-col cols="12" lg="2">
              <div class="font-weight-bold mb-2 mt-3">First Name</div>
            </v-col>
            <v-col cols="12" lg="10">
              <TextField
                v-model="horizontalForm.fName"
                hide-details
                placeholder="Enter your first name"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="2">
              <div class="font-weight-bold mb-2 mt-3">Last Name</div>
            </v-col>
            <v-col cols="12" lg="10">
              <TextField
                v-model="horizontalForm.lName"
                hide-details
                placeholder="Enter your last name"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" lg="2">
              <div class="font-weight-bold mb-2 mt-3">Company Name</div>
            </v-col>
            <v-col cols="12" lg="10">
              <TextField
                v-model="horizontalForm.company"
                hide-details
                placeholder="Enter your company name"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="2">
              <div class="font-weight-bold mb-2 mt-3">Phone Number</div>
            </v-col>
            <v-col cols="12" lg="10">
              <TextField
                v-model="horizontalForm.phone"
                hide-details
                placeholder="Enter your phone number"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="2">
              <div class="font-weight-bold mb-2 mt-3">Email Address</div>
            </v-col>
            <v-col cols="12" lg="10">
              <TextField
                v-model="horizontalForm.email"
                hide-details
                placeholder="example@gmail.com"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="2">
              <div class="font-weight-bold mb-2 mt-3">Address</div>
            </v-col>
            <v-col cols="12" lg="10">
              <TextArea
                v-model="horizontalForm.address"
                hide-details
                placeholder="Enter your Address"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="2">
              <div class="font-weight-bold mb-2 mt-3">City</div>
            </v-col>
            <v-col cols="12" lg="10">
              <TextField
                v-model="horizontalForm.city"
                hide-details
                placeholder="Enter your city"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="2">
              <div class="font-weight-bold mb-2 mt-3">State</div>
            </v-col>
            <v-col cols="12" lg="10">
              <v-select
                v-model="horizontalForm.state"
                hide-details
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>

          <div class="mt-4 d-flex justify-end">
            <v-btn color="primary"> Submit </v-btn>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Input field sizing" class="h-100">
        <v-card-text>
          <v-row>
            <v-col cols="12" lg="2">
              <div class="font-weight-bold mb-2 mt-3">Email</div>
            </v-col>
            <v-col cols="12" lg="10">
              <TextField
                v-model="fieldSizing.default"
                hide-details
                density="default"
                placeholder="density: default"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" lg="2">
              <div class="font-weight-bold mb-2 mt-3">Email</div>
            </v-col>
            <v-col cols="12" lg="10">
              <TextField
                v-model="fieldSizing.comfortable"
                hide-details
                density="comfortable"
                placeholder="density: comfortable"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" lg="2">
              <div class="font-weight-bold mb-2 mt-3">Email</div>
            </v-col>
            <v-col cols="12" lg="10">
              <TextField
                v-model="fieldSizing.compact"
                hide-details
                density="compact"
                placeholder="density: compact"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <Card title="Floating Labels" elevation="0" class="mt-5">
          <v-card-text>
            <v-row>
              <v-col cols="12" lg="2">
                <div class="font-weight-bold mb-2 mt-3">Email</div>
              </v-col>
              <v-col cols="12" lg="10">
                <TextField
                  v-model="fieldSizing.floatDefault"
                  hide-details
                  density="default"
                  placeholder="density: default"
                  label="density: default"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" lg="2">
                <div class="font-weight-bold mb-2 mt-3">Email</div>
              </v-col>
              <v-col cols="12" lg="10">
                <TextField
                  v-model="fieldSizing.floatComfortable"
                  hide-details
                  density="comfortable"
                  placeholder="density: comfortable"
                  label="density: comfortable"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" lg="2">
                <div class="font-weight-bold mb-2 mt-3">Email</div>
              </v-col>
              <v-col cols="12" lg="10">
                <TextField
                  v-model="fieldSizing.floatCompact"
                  hide-details
                  density="compact"
                  placeholder="density: compact"
                  label="density: compact"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </Card>
      </Card>
    </v-col>
    <v-col cols="12">
      <Card title="Column Sizing">
        <v-card-text>
          <v-row>
            <v-col cols="12" lg="6">
              <TextField
                v-model="columnSizing.fName"
                hide-details
                placeholder="First name"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <TextField
                v-model="columnSizing.lName"
                hide-details
                placeholder="Last name"
              />
            </v-col>
            <v-col cols="12" lg="4">
              <TextField
                v-model="columnSizing.email"
                hide-details
                placeholder="Email ID"
              />
            </v-col>
            <v-col cols="12" lg="4">
              <TextField
                v-model="columnSizing.password"
                hide-details
                placeholder="Password"
              />
            </v-col>
            <v-col cols="12" lg="4">
              <TextField
                v-model="columnSizing.confirmPassword"
                hide-details
                placeholder="Confirm Password"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <TextField
                v-model="columnSizing.city"
                hide-details
                placeholder="City"
              />
            </v-col>
            <v-col cols="12" lg="3">
              <TextField
                v-model="columnSizing.state"
                hide-details
                placeholder="State"
              />
            </v-col>
            <v-col cols="12" lg="3">
              <TextField
                v-model="columnSizing.zip"
                hide-details
                placeholder="Zip"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12">
      <Card title="Inline Forms">
        <v-card-text>
          <v-row align="center">
            <v-col cols="4">
              <TextField
                v-model="inline.username"
                placeholder="Username"
                hide-details
              >
                <template #prepend-inner>
                  <div
                    class="bg-secondary-subtle h-100 px-3 d-flex align-center"
                  >
                    @
                  </div>
                </template>
              </TextField>
            </v-col>
            <v-col cols="2">
              <v-select
                v-model="inline.state"
                placeholder="Choose"
                variant="solo"
                density="compact"
                hide-details
                class="menu-select-filter"
              />
            </v-col>
            <v-col cols="auto">
              <v-checkbox v-model="inline.check" hide-details color="primary">
                <template #label>
                  <span> Remember me</span>
                </template>
              </v-checkbox>
            </v-col>
            <v-col cols="auto"> <v-btn color="primary">Submit</v-btn> </v-col>
          </v-row>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
