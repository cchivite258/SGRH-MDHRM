<script lang="ts" setup>
import { ref } from "vue";

const github = ref("");
const website = ref("");
const dribble = ref("");
const pinterest = ref("");
const whatsapp = ref("");
</script>
<template>
  <Card title="Social Media Profile" elevation="0">
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
              <div class="font-weight-bold mb-2">Github</div>
              <TextField hide-details v-model="github" placeholder="Username" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Website</div>
              <TextField
                hide-details
                v-model="website"
                placeholder="www.example.com"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Dribble</div>
              <TextField
                hide-details
                v-model="dribble"
                placeholder="Username"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Pinterest</div>
              <TextField
                hide-details
                v-model="pinterest"
                placeholder="Username"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Whatsapp</div>
              <TextField
                hide-details
                v-model="whatsapp"
                placeholder="258 0123 6789"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
