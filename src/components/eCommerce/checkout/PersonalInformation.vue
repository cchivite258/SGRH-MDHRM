<script lang="ts" setup>
import { ref } from "vue";
import { country } from "@/components/eCommerce/checkout/utils";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

const form = ref({
  name: "",
  phoneNumber: "",
  email: "",
  city: "",
  state: "",
  country: "",
  zip: "",
  address: "",
});
</script>
<template>
  <Card title="Personal Information">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="6">
          <h5 class="text-caption font-weight-bold pb-2">Name</h5>
          <TextField v-model="form.name" placeholder="Name" hide-details />
        </v-col>
        <v-col cols="12" lg="6">
          <h5 class="text-caption font-weight-bold pb-2">Phone Number</h5>
          <TextField
            v-model="form.phoneNumber"
            placeholder="Phone Number"
            hide-details
          />
        </v-col>

        <v-col cols="12" lg="6">
          <h5 class="text-caption font-weight-bold pb-2">Email Address</h5>
          <TextField
            v-model="form.email"
            placeholder="Email Address"
            hide-details
          />
        </v-col>
        <v-col cols="12" lg="6">
          <h5 class="text-caption font-weight-bold pb-2">City</h5>
          <TextField v-model="form.city" placeholder="City" hide-details />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" lg="4">
          <h5 class="text-caption font-weight-bold pb-2">State</h5>
          <TextField v-model="form.state" placeholder="State" hide-details />
        </v-col>
        <v-col cols="12" lg="4">
          <h5 class="text-caption font-weight-bold pb-2">Country</h5>
          <MenuSelect v-model="form.country" :items="country" />
        </v-col>
        <v-col cols="12" lg="4">
          <h5 class="text-caption font-weight-bold pb-2">Zip Code</h5>
          <TextField v-model="form.zip" placeholder="Zip Code" hide-details />
        </v-col>
        <v-col cols="12">
          <h5 class="text-caption font-weight-bold pb-2">Address</h5>
          <TextArea v-model="form.address" placeholder="Enter address" />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
