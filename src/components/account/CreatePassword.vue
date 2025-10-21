<script lang="ts" setup>
import { ref, computed } from "vue";
import appConfigs from "@/app/appConfigurations";
import { fakeBackendService } from "@/app/http/httpServiceProvider";
import { useRouter } from "vue-router";
const router = useRouter();

const isRemember = ref(true);
const loading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

const isSubmitted = ref(false);

const formData = ref({
  password: { value: "", isValid: false },
  confirmPassword: { value: "", isValid: false },
  username: { value: "", isValid: false },
});

const isValidFormData = computed(() => {
  return (
    formData.value.username.isValid &&
    formData.value.password.isValid &&
    formData.value.confirmPassword.isValid
  );
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
    const { password, username, confirmPassword } = formData.value;

    const payload = {
      password: password.value,
      username: username.value,
      confirmPassword: confirmPassword.value,
    };

    if (auth === "fakebackend") {
      const data = await fakeBackendService.createPassword(payload);

      if (data) {
        successMsg.value = data;
        isSubmitted.value = false;
        formData.value = {
          confirmPassword: { value: "", isValid: false },
          username: { value: "", isValid: false },
          password: { value: "", isValid: false },
        };
      }
      setTimeout(() => {
        router.push({ path: "/signin" });
      }, 2000);
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
        <h5 class="text-h6 font-weight-bold">Create new password</h5>
        <div class="text-muted mt-1 font-weight-regular">
          Your new password must be different from previous used password.
        </div>
      </v-card-title>
      <v-card-text class="mt-5">
        <v-row justify="center" class="align-center">
          <v-col cols="12" lg="8">
            <v-alert
              v-if="errorMsg"
              class="mb-3"
              color="danger"
              variant="tonal"
              density="compact"
            >
              {{ errorMsg }}
            </v-alert>

            <v-alert
              v-if="successMsg"
              class="mb-3"
              color="success"
              variant="tonal"
              density="compact"
            >
              {{ successMsg }}
            </v-alert>
            <div class="font-weight-medium mb-1 mb-1 mt-5">
              Username <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="formData.username"
              :value="formData.username.value"
              isRequired
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
              placeholder="Enter username"
              hide-details
            />
            <div class="d-flex justify-space-between align-center mt-5">
              <div class="font-weight-medium mb-1">
                Password <i class="ph-asterisk ph-xs text-danger" />
              </div>
            </div>
            <TextField
              v-model="formData.password"
              hide-details
              isRequired
              isPassword
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
            />
            <div class="text-muted mb-4 text-caption">
              Your password must be 8-20 characters long.
            </div>

            <div class="d-flex justify-space-between align-center mt-5">
              <div class="font-weight-medium mb-1">
                Confirm Password <i class="ph-asterisk ph-xs text-danger" />
              </div>
            </div>
            <TextField
              v-model="formData.confirmPassword"
              isRequired
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
              hide-details
              isPassword
            />
            <v-checkbox v-model="isRemember" hide-details color="primary">
              <template #label>
                <span class="text-caption">Remember me</span>
              </template>
            </v-checkbox>
            <v-btn color="primary" block class="mt-4" @click="onReset">
              Reset Password
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
