<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { comingSoon } from "@/assets/images/auth/utils";
const email = ref({
  value: "",
  isValid: false,
});

const time = ref(59);

onMounted(() => {
  setInterval(() => {
    if (time.value > 0) {
      time.value--;
    }
  }, 1000);
});
</script>
<template>
  <div v-if="time > 0" class="h-100 d-flex align-center justify-center">
    <v-card elevation="0" class="w-100">
      <v-card-text class="mt-5">
        <v-img :src="comingSoon" height="110" />
        <h5 class="text-h5 font-weight-bold text-center mt-8 mb-4">
          Coming Soon
        </h5>
        <v-row justify="center" class="mt-8 align-center">
          <v-col
            cols="auto"
            class="d-flex align-center justify-center flex-column"
          >
            <div class="text-muted font-weight-bold mb-1 text-uppercase">
              Days
            </div>
            <div
              class="bg-primary-subtle text-h4 font-weight-bold rounded py-7 px-8"
            >
              0
            </div>
          </v-col>
          <span class="text-h4 font-weight-bold mt-4">:</span>
          <v-col
            cols="auto"
            class="d-flex align-center justify-center flex-column"
          >
            <div class="text-muted font-weight-bold mb-1 text-uppercase">
              Hours
            </div>

            <div
              class="bg-primary-subtle text-h4 font-weight-bold rounded py-7 px-8"
            >
              0
            </div>
          </v-col>
          <span class="text-h4 font-weight-bold mt-4">:</span>

          <v-col
            cols="auto"
            class="d-flex align-center justify-center flex-column"
          >
            <div class="text-muted font-weight-bold mb-1 text-uppercase">
              Minutes
            </div>

            <div
              class="bg-primary-subtle text-h4 font-weight-bold rounded py-7 px-8"
            >
              0
            </div>
          </v-col>
          <span class="text-h4 font-weight-bold mt-4">:</span>

          <v-col
            cols="auto"
            class="d-flex align-center justify-center flex-column"
          >
            <div class="text-muted font-weight-bold mb-1 text-uppercase">
              Seconds
            </div>

            <div
              class="bg-primary-subtle text-h4 font-weight-bold rounded py-7 px-8"
            >
              {{ time }}
            </div>
          </v-col>
        </v-row>
        <v-row justify="center" class="mt-8">
          <v-col cols="12" lg="9">
            <div class="font-weight-bold text-h6">
              Get notification when we launch
            </div>
            <div class="text-muted mb-8">
              Don't worry we will not spam you 😊
            </div>
            <TextField
              v-model="email"
              :value="email.value"
              isRequired
              isEmail
              showError
              hide-details
              placeholder="Place your email address"
            >
              <template #append-inner>
                <v-btn color="primary" class="px-2">
                  Send <i class="ph-paper-plane-right ms-1" />
                </v-btn>
              </template>
            </TextField>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
  <div v-else class="h-100 d-flex align-center justify-center">
    <v-card elevation="0" class="w-100">
      <v-card-title class="text-center">
        <h5 class="text-h6 font-weight-medium">
          We've Launched our new website
        </h5>
        <div class="text-muted mt-1">
          Click the below button to visit our website.
        </div>
      </v-card-title>
      <v-card-text class="mt-5 text-center">
        <v-img src="@/assets/images/success-img.png" height="120" />
        <v-btn color="primary" class="mt-8" to="/">
          Back to Home <i class="ph-arrow-right ms-1" />
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>
