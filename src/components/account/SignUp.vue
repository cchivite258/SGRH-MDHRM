<script lang="ts" setup>
import { socialMedias } from "@/components/auth/utils";
import { ref, computed } from "vue";
import appConfigs from "@/app/appConfigurations";
import { UserType } from "@/app/http/types";
import { fakeBackendService } from "@/app/http/httpServiceProvider";
import { useRouter } from "vue-router";
const router = useRouter();

const loading = ref(false);
const isSubmitted = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
const formData = ref({
  email: { value: "", isValid: false },
  username: { value: "", isValid: false },
  password: { value: "", isValid: false },
});

const isValidFormData = computed(() => {
  return (
    formData.value.username.isValid &&
    formData.value.password.isValid &&
    formData.value.email.isValid
  );
});

const onSignUp = async () => {
  try {
    loading.value = true;
    errorMsg.value = "";
    successMsg.value = "";
    isSubmitted.value = true;

    if (!isValidFormData.value) {
      return;
    }
    const auth = appConfigs.auth;
    const { password, username, email } = formData.value;

    const payload: UserType = {
      password: password.value,
      username: username.value,
      email: email.value,
    };

    if (auth === "backend") {
      const data = await fakeBackendService.signUp(payload);
      if (data) {
        successMsg.value = data;
        isSubmitted.value = false;
        formData.value = {
          email: { value: "", isValid: false },
          username: { value: "", isValid: false },
          password: { value: "", isValid: false },
        };

        setTimeout(() => {
          router.push({ path: "/signin" });
        }, 2000);
      }
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
        <h5 class="text-h6 font-weight-bold">Create your free account</h5>
        <div class="text-muted">Get your free Steex account now</div>
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
            <div class="font-weight-medium mb-1">
              Email <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="formData.email"
              :value="formData.email.value"
              isRequired
              isEmail
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
              placeholder="Enter email address"
              hideDetails
            />
            <div class="font-weight-medium mb-2 mt-5">
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
            <div class="d-flex justify-space-between align-center mt-3 pb-2">
              <div class="font-weight-medium">
                Password <i class="ph-asterisk ph-xs text-danger" />
              </div>
            </div>
            <TextField
              v-model="formData.password"
              :value="formData.password.value"
              isRequired
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
              placeholder="Enter password"
              hide-details
              isPassword
            />
            <div class="mt-4 mb-5">
              <span class="text-muted">
                By registering you agree to the Steex
              </span>
              <v-btn
                class="px-0 text-decoration-underline"
                color="primary"
                variant="text"
                to="/pages/term-conditions"
              >
                Terms of Use
              </v-btn>
            </div>
            <v-btn color="primary" block @click="onSignUp"> Sign Up </v-btn>
            <div class="d-flex align-center mt-8">
              <v-divider class="border-dashed" />
              <div class="w-100 text-center font-weight-bold text-muted">
                Create account with
              </div>
              <v-divider class="border-dashed" />
            </div>

            <div class="text-center mt-4">
              <v-hover
                v-for="(item, index) in socialMedias"
                :key="'social-media-' + index"
              >
                <template v-slot:default="{ isHovering, props }">
                  <v-btn
                    v-bind="props"
                    :color="item.color"
                    density="comfortable"
                    icon
                    :variant="!isHovering ? 'tonal' : 'elevated'"
                    rounded
                    class="ma-1"
                  >
                    <i :class="item.icon" />
                  </v-btn>
                </template>
              </v-hover>
            </div>
            <div class="text-center mt-5 d-flex align-center justify-center">
              Already have an account ?
              <v-btn
                to="/signin"
                variant="text"
                color="primary"
                class="font-weight-bold text-decoration-underline pa-0"
              >
                SignIn
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </div>
  </div>
</template>
