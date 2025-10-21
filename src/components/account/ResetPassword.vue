<script lang="ts" setup>
import { ref, computed } from "vue";
import { email } from "@/assets/images/auth/utils";
import { fakeBackendService } from "@/app/http/httpServiceProvider";
import appConfigs from "@/app/appConfigurations";

const errorMsg = ref("");
const successMsg = ref("");
const loading = ref(false);
const isSubmitted = ref(false);

const formData = ref({
  email: { value: "", isValid: false },
});

const isValidFormData = computed(() => {
  return formData.value.email.isValid;
});

const onReset = async () => {
  try { 
    loading.value = true;
    errorMsg.value = "";
    successMsg.value = "";
    isSubmitted.value = true;

    if (!isValidFormData.value) {
      return;
    }

    const auth = appConfigs.auth;

    if (auth === "fakebackend") {
      const data = await fakeBackendService.resetPassword(
        formData.value.email.value
      );
      successMsg.value = data;
    }
  } catch (error: any) {
    errorMsg.value = error.message;
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <div class="h-100 d-flex align-center justify-center">
    <div class="w-100">
      <v-card-title class="text-center">
        <h5 class="text-h6 font-weight-bold">Forgot Password?</h5>
        <div class="text-muted mt-1 font-weight-regular">
          Reset password with Steex
        </div>
      </v-card-title>
      <v-card-text class="mt-5">
        <v-row justify="center" class="align-center">
          <v-col cols="12" lg="8">
            <v-img :src="email" alt="" height="80" />

            <v-alert
              v-if="successMsg"
              class="my-3"
              color="success"
              variant="tonal"
              density="compact"
            >
              {{ successMsg }}
            </v-alert>
            <v-alert
              v-if="errorMsg"
              class="mb-3"
              color="danger"
              variant="tonal"
              density="compact"
            >
              {{ errorMsg }}
            </v-alert>
            <v-alert color="warning" variant="tonal" class="my-4 ps-8"
              >Enter your email and instructions will be sent to you!
            </v-alert>

            <div class="font-weight-medium mb-1">
              Email <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="formData.email"
              placeholder="Enter email"
              isRequired
              hide-details
              isEmail
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
            />

            <v-btn color="primary" block class="mt-4" @click="onReset">
              Send Reset Link
            </v-btn>

            <div class="text-center mt-5 d-flex align-center justify-center">
              Wait, I remember my password...
              <v-btn
                to="/signin"
                variant="text"
                color="primary"
                class="font-weight-bold text-decoration-underline pa-0"
              >
                Click here
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </div>
  </div>
</template>
