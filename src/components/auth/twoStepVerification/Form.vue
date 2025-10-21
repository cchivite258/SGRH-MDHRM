<script lang="ts" setup>
import { ref, computed } from "vue";
import { permission } from "@/assets/images/auth/utils";
import { useRoute, useRouter } from "vue-router";
import { authService } from "@/app/http/httpServiceProvider";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const email = route.query.email as string;

const authStore = useAuthStore();

const form = ref([
  { value: "", isValid: true },
  { value: "", isValid: true },
  { value: "", isValid: true },
  { value: "", isValid: true },
  { value: "", isValid: true },
  { value: "", isValid: true }
]);

const isSubmitted = ref(false);
const loading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null // Modificado para usar let em vez de ref

// Computed property para juntar todos os dígitos do OTP
const otpCode = computed(() => {
  return form.value.map(item => item.value).join('');
});

const handlePaste = (event: ClipboardEvent) => {
  const pasteData = event.clipboardData?.getData('text/plain').trim() || '';
  const digits = pasteData.replace(/\D/g, '').split('').slice(0, 6); // Pega apenas dígitos e limita a 6

  // Preenche os campos com os dígitos colados
  digits.forEach((digit, index) => {
    form.value[index].value = digit;
  });

  // Foca no último campo preenchido ou no último campo se todos estiverem preenchidos
  const nextIndex = Math.min(digits.length, 5) + 1;
  getElement(nextIndex)?.focus();

  event.preventDefault();
};

const getElement = (index: number) => {
  return document.getElementById(`digit-${index}`);
};

const moveToNext = (event: KeyboardEvent, nextIndex: number) => {
  if (event.key !== "Backspace" && /^\d$/.test(event.key)) {
    if (nextIndex < 7) {
      getElement(nextIndex)?.focus();
    } else {
      getElement(nextIndex)?.blur();
    }
  }
};

const moveToPrev = (event: KeyboardEvent, prevIndex: number) => {
  if (event.key === "Backspace") {
    if (prevIndex > 0) {
      getElement(prevIndex)?.focus();
    } else {
      getElement(prevIndex)?.blur();
    }
  }
};

const verifyCode = async () => {
  try {
    loading.value = true;
    errorMsg.value = "";
    isSubmitted.value = true;

    // Verifica se todos os campos estão preenchidos
    if (form.value.some(item => !item.value)) {
      errorMsg.value = t('t-please-enter-complete-code');
      setTimeout(() => {
        errorMsg.value = "";
      }, 3000);
      return;
    }

    // Chama o serviço de verificação
    const response = await authService.verifyEmail(
      email,          // string
      otpCode.value   // string
    );

    console.log("Verification response:", response);
    // Armazena o token usando a função setToken
    authStore.setToken(response.data.token);

    successMsg.value = t("t-validanting-code");

    // Redireciona para a página de reset de senha
    setTimeout(() => {
      router.push('/auth/pass-change');
      }, 2000);
    

  } catch (error: any) {
    console.error("Verification error:", error);
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
      <v-card-title class="text-center mt-10">
        <v-img :src="permission" height="60" />
        <h5 class="text-h6 font-weight-bold mt-4">{{ $t('t-verify-your-email') }}</h5>
        <div class="text-muted mt-1 font-weight-regular">
          {{ $t('t-enter-the-6-digit-code') }} <b>{{ email }}</b>
        </div>
        <transition name="fade">
              <v-alert v-if="successMsg" :text="successMsg" type="warning" class="mb-4 mx-16 mt-3" variant="tonal" color="warning"
              density="compact" @click="successMsg = ''" style="cursor: pointer;" />
          </transition>
          <transition name="fade">
              <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-16 mt-3" variant="tonal" color="danger"
              density="compact" @click="errorMsg = ''" style="cursor: pointer;" />
          </transition>
      </v-card-title>

      <v-card-text>
        <v-row justify="center" class="align-center">
          <v-col cols="12" lg="8">
            <v-row class="mt-4" @paste.prevent="handlePaste">
              <v-col cols="2" v-for="(item, index) in form" :key="index">
                <div class="mb-3">
                  <TextField class="two-step-verification-field" v-model="item.value" :id="`digit-${index + 1}`"
                    placeholder="0" maxLength="1" isRequired :showError="isSubmitted && !item.value" hide-details
                    @keyup="moveToNext($event, index + 2)" @keyup.delete="moveToPrev($event, index)" inputmode="numeric"
                    pattern="[0-9]*" />

                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-row justify="center" class="align-center mt-4">
          <v-col cols="12" lg="8">
            <v-btn color="primary" block height="40" @click="verifyCode" :loading="loading"
              :disabled="loading || otpCode.length < 6">
              {{ $t('t-confirm') }}
            </v-btn>
          </v-col>
        </v-row>

        <div class="text-center mt-5 d-flex align-center justify-center">
          {{ $t('t-didnt-receive-a-code') }}
          <v-btn to="/auth/pass-reset" variant="text" color="primary" 
            class="font-weight-bold text-decoration-underline pa-0">
            {{ $t('t-resent') }}
          </v-btn>
        </div>
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
