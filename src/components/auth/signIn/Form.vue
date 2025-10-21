<script lang="ts" setup>
import { socialMedias } from "@/components/auth/utils";
import { ref, computed } from "vue";
import appConfigs from "@/app/appConfigurations";
import { authService } from "@/app/http/httpServiceProvider";
import { useRouter } from "vue-router";
import { UserType } from "@/app/http/types";

const router = useRouter();

const loading = ref(false);
const isSubmitted = ref(false);
const isRemember = ref(false);
const errorMsg = ref("");
const formData = ref({
  email: { value: "admin", isValid: true },
  password: { value: "admin", isValid: true },
});

const isValidFormData = computed(() => {
  return formData.value.email.isValid && formData.value.password.isValid;
});

const onSignIn = async () => {
  try {
    loading.value = true;
    errorMsg.value = "";
    isSubmitted.value = true;
    if (!isValidFormData.value) {
      return;
    }

    const auth = appConfigs.auth;
    const { password, email } = formData.value;
    const payload: UserType = {
      password: password.value,
      email: email.value,
    };

    if (auth === "authService") {
      const data = await authService.login(payload.email, payload.password);
      if (data) {
        router.push({ path: "/" });
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
        <h5 class="text-h6 font-weight-bold mt-10">{{ $t('t-login') }}</h5>
        <div class="text-muted font-weight-regular">
          {{$t('t-welcome-back')}}
        </div>
      </v-card-title>
      <v-card-text class="mt-5">
        <v-row justify="center" class="align-center">
          <v-col cols="12" lg="8">
            <v-alert v-if="errorMsg" class="mb-3" color="danger" variant="tonal" density="compact">
              {{ errorMsg }}
            </v-alert>
            <div class="font-weight-medium mb-1">
              {{$t('t-email')}} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="formData.email" isRequired :showError="isSubmitted" :isSubmitted="isSubmitted"
              hideDetails placeholder="Enter email" />
            <div class="d-flex justify-space-between align-center mt-4">
              <div class="font-weight-medium">
                {{$t('t-password')}}  <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <v-btn variant="plain" class="px-0 font-weight-regular" to="/auth/pass-reset">
                {{$t('t-forgot-password')}} 
              </v-btn>
            </div>
            <TextField v-model="formData.password" placeholder="Enter password" hide-details :showError="isSubmitted"
              :isSubmitted="isSubmitted" isRequired isPassword />
            <v-checkbox v-model="isRemember" hide-details color="primary" class="my-1">
              <template #label>
                <span>{{$t('t-remeber-password')}} </span>
              </template>
            </v-checkbox>
            <v-btn color="primary" block class="mt-2" :loading="loading" @click="onSignIn">
              {{$t('t-sign-in')}} 
            </v-btn>
            <div class="d-flex align-center mt-10">
              <v-divider class="border-dashed" />
              <div class="w-50 text-center font-weight-bold mx-3">
                {{$t('t-sign-in-with')}}
              </div>
              <v-divider class="border-dashed" />
            </div>

            <div class="text-center mt-8">
              <v-hover v-for="(item, index) in socialMedias" :key="'social-media-' + index">
                <template v-slot:default="{ isHovering, props }">
                  <v-btn v-bind="props" :color="item.color" density="comfortable" icon elevation="0"
                    :variant="!isHovering ? 'tonal' : 'elevated'" rounded class="ma-1" height="40" width="40">
                    <i :class="item.icon" />
                  </v-btn>
                </template>
              </v-hover>
            </div>
            <div class="text-center mt-8 d-flex align-center justify-center">
              {{$t('t-dont-have-account')}}
              <v-btn to="/auth/signup" variant="text" color="primary"
              class="font-weight-bold text-decoration-underline pa-0">
                  {{$t('t-sign-up')}}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </div>
  </div>
</template>
