<script lang="ts" setup>
import { ref, computed } from "vue";
import appConfigs from "@/app/appConfigurations";
import { authService } from "@/app/http/httpServiceProvider";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { h } from "vue";


const router = useRouter();
const { t } = useI18n();
const isRemember = ref(true);
const loading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null; 
const isSubmitted = ref(false);

const formData = ref({
  password: { value: "", isValid: false },
  confirmPassword: { value: "", isValid: false }
});

const isValidFormData = computed(() => {
  return (
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
    const { password, confirmPassword } = formData.value;

    const payload = {
      password: password.value,
      confirmPassword: confirmPassword.value,
    };

    if (auth === "authService") {
      const data = await authService.resetPassword(payload.password, payload.confirmPassword);

      if (data) {
        successMsg.value = t("t-reseting-password");
        setTimeout(() => {
          successMsg.value = "";
        }, 3000);
        isSubmitted.value = false;
        formData.value = {
          confirmPassword: { value: "", isValid: false },
          password: { value: "", isValid: false },
        };
      }
      setTimeout(() => {
        router.push({ path: "/signin" });
      }, 2000);
    }
  } catch (error: any) {
    handleApiError(error);
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};

const handleApiError = (error: any) => {
  if (error.response) {
    errorMsg.value = error.response.data.message;
  } else if (error.request) {
    errorMsg.value = "No response from server.";
  } else {
    errorMsg.value = error.message;
  }
  if (alertTimeout) {
    clearTimeout(alertTimeout);
  }
  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
  }, 3000);
};
</script>
<template>
  <div class="h-100 d-flex align-center justify-center">
    <div class="w-100">
      <v-card-title class="text-center mt-10">
        <h5 class="text-h6 font-weight-bold">{{ $t('t-create-new-password') }}</h5>
        <div class="text-muted mt-1 font-weight-regular">
          {{ $t('t-reset-password') }}
        </div>
      </v-card-title>
      <v-card-text class="">
        <v-row justify="center" class="align-center">
          <v-col cols="12" lg="8">
            <transition name="fade">
              <v-alert v-if="successMsg" :text="successMsg" type="warning" class="mb-4 mx-16 mt-3" variant="tonal" color="warning"
              density="compact" @click="successMsg = ''" style="cursor: pointer;" />
          </transition>
          <transition name="fade">
              <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-16 mt-3" variant="tonal" color="danger"
              density="compact" @click="errorMsg = ''" style="cursor: pointer;" />
          </transition>
            <div class="d-flex justify-space-between align-center mt-5">
              <div class="font-weight-medium mb-1">
                {{$t('t-password')}} <i class="ph-asterisk ph-xs text-danger" />
              </div>
            </div>
            <TextField v-model="formData.password" hide-details isRequired isPassword :showError="isSubmitted"
              :isSubmitted="isSubmitted" />
            <div class="d-flex justify-space-between align-center mt-5">
              <div class="font-weight-medium mb-1">
                {{ $t('t-confirm-password') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
            </div>
            <TextField v-model="formData.confirmPassword" isRequired :showError="isSubmitted" :isSubmitted="isSubmitted"
              hide-details isPassword />
            <v-btn color="primary" block class="mt-4" @click="onReset" :loading="loading">
              {{ $t('t-reset-password') }}
            </v-btn>

            <div class="text-center mt-5 d-flex align-center justify-center">
              {{ $t('t-wait-remember-password') }}
              <v-btn to="/signin" variant="text" color="primary" 
                class="font-weight-bold text-decoration-underline pa-0">
                {{ $t('t-click-here') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </div>
  </div>
</template>

<style scoped>
/* Opcional: barra de progresso */
.v-alert {
  position: relative;
  overflow: hidden;
}

.v-alert::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  transform: scaleX(0);
  transform-origin: left;
  animation: progressBar 3s linear forwards;
}

@keyframes progressBar {
  to {
    transform: scaleX(1);
  }
}

</style>
