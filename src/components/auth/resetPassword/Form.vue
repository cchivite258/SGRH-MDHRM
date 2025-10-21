<script lang="ts" setup>
import { ref, computed } from "vue";
import { email } from "@/assets/images/auth/utils";
import { authService } from "@/app/http/httpServiceProvider";
import appConfigs from "@/app/appConfigurations";
import { useI18n } from "vue-i18n"
import { ro } from "@/assets/images/flags/utils";
import { useRouter } from "vue-router";

const { t } = useI18n()

const errorMsg = ref("")
const router = useRouter();
let alertTimeout: ReturnType<typeof setTimeout> | null = null // Modificado para usar let em vez de ref
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

    if (auth === "authService") {
      const data = await authService.forgotPassword(
        formData.value.email.value
      );

      successMsg.value = t("t-sending-reset-code");

      setTimeout(() => {
      router.push({
        path: "/auth/verify-email",
        query: { email: formData.value.email.value }
      });
    }, 2000);
    }
  } catch (error: any) {
    console.error("Error:", error);
    handleApiError(error);

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
      <v-card-title class="text-center">
        <h5 class="text-h6 font-weight-bold mt-10">{{ $t('t-forgot-password') }}</h5>
        <div class="text-muted mt-1 font-weight-regular">
          {{ $t('t-reset-password') }}
        </div>
      </v-card-title>
      <v-card-text class="mt-5">
        <v-row justify="center" class="align-center">
          <v-col cols="12" lg="8">
            <v-img :src="email" alt="" height="80" />
            <transition name="fade">
              <v-alert v-if="successMsg" :text="successMsg" type="warning" class="mb-4 mx-5 mt-3" variant="tonal" color="warning"
              density="compact" @click="successMsg = ''" style="cursor: pointer;" />
            </transition>
            
            <transition name="fade">
              <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-5 mt-3" variant="tonal" color="danger"
              density="compact" @click="errorMsg = ''" style="cursor: pointer;" />

            </transition>

            <div class="font-weight-medium mb-1">
              {{ $t('email') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="formData.email" :placeholder="$t('t-enter-your-email')" isRequired hide-details isEmail
              :showError="isSubmitted" :isSubmitted="isSubmitted" />

            <v-btn color="primary" block class="mt-4" @click="onReset" :loading="loading">
              {{ $t('t-send-reset-code') }}
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
