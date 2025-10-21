<script lang="ts" setup>
import { ref, onBeforeUnmount } from "vue";
import Table from "@/app/common/components/Table.vue";
import {
  productsHeader,
  loginHistory,
} from "@/components/pages/profileSettings/utils";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { userService } from "@/app/http/httpServiceProvider"; // ajuste conforme sua estrutura

const { t } = useI18n();
const toast = useToast();

const isSubmitted = ref(false);
const loading = ref(false);
const errorMsg = ref("");
let alertTimeout: any = null;

const formData = ref({
  oldPswd: { value: "", isValid: true },
  newPswd: { value: "", isValid: true },
  confirmPswd: { value: "", isValid: true },
});

const formErrors = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});


const validateForm = () => {
  const { oldPswd, newPswd, confirmPswd } = formData.value;

  formErrors.value.oldPassword = oldPswd.value ? "" : t("t-required-field");
  formErrors.value.newPassword = newPswd.value ? "" : t("t-required-field");
  formErrors.value.confirmPassword = confirmPswd.value ? "" : t("t-required-field");

  oldPswd.isValid = !formErrors.value.oldPassword;
  newPswd.isValid = !formErrors.value.newPassword;
  confirmPswd.isValid = !formErrors.value.confirmPassword;

  return oldPswd.isValid && newPswd.isValid && confirmPswd.isValid;
};


const handleApiError = (error: any) => {
  if (alertTimeout) clearTimeout(alertTimeout);
  errorMsg.value = error?.error?.message || t('t-verification-password-error');
  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

const submitForm = async () => {
  isSubmitted.value = true;

  // Verificação extra para garantir que senhas coincidem
  if (formData.value.newPswd.value !== formData.value.confirmPswd.value) {
    errorMsg.value = t("t-not-match-passwords");
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return;
  }

  if (!validateForm()) {
    errorMsg.value = t("t-form-invalid");
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return;
  }

  loading.value = true;
  try {
    const payload = {
      oldPassword: formData.value.oldPswd.value,
      newPassword: formData.value.newPswd.value,
      confirmPassword: formData.value.confirmPswd.value,
      passwordsMatching: formData.value.newPswd.value === formData.value.confirmPswd.value,
    };

    console.log("Payload enviado:", formData.value.newPswd.value, formData.value.confirmPswd.value, payload);


    const response = await userService.updatePassword(payload); // ajuste conforme seu endpoint

    

    if (response.status === "error") {
      handleApiError(response);
    } else {
      toast.success(t("t-password-changed-success"));
      // Limpar os campos após sucesso
      formData.value.oldPswd.value = "";
      formData.value.newPswd.value = "";
      formData.value.confirmPswd.value = "";
      isSubmitted.value = false;
    }
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    toast.error(t('t-password-changed-error'));
    errorMsg.value = t('t-password-changed-error');
    handleApiError(error);
  } finally {
    loading.value = false;
  }
};

onBeforeUnmount(() => {
  if (alertTimeout) clearTimeout(alertTimeout);
});

const onChange = () => {
  isSubmitted.value = true;
};
</script>
<template>
  <Card :title="$t('t-change-password')">
    <v-card-text>
      <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4" variant="tonal" color="danger"
        density="compact" />
      <v-row>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-1">
            {{ $t('t-old-password') }} <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="formData.oldPswd.value" :placeholder="$t('t-enter-password')" hide-details
            :showError="isSubmitted" :isSubmitted="isSubmitted" isPassword />
          <div v-if="formErrors.oldPassword" class="text-red text-extra-small pt-1">
            {{ formErrors.oldPassword }}
          </div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-1">
            {{ $t('t-new-password') }}<i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="formData.newPswd.value" :placeholder="$t('t-enter-password')" hide-details
            :showError="isSubmitted" :isSubmitted="isSubmitted" isPassword />
          <div v-if="formErrors.newPassword" class="text-red text-extra-small pt-1">
            {{ formErrors.newPassword }}
          </div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-1">
            {{ $t('t-confirm-password') }} <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="formData.confirmPswd.value" :placeholder="$t('t-enter-password')" hide-details
            :showError="isSubmitted" :isSubmitted="isSubmitted" isPassword />
          <div v-if="formErrors.confirmPassword" class="text-red text-extra-small pt-1">
            {{ formErrors.confirmPassword }}
          </div>
        </v-col>
      </v-row>
      <div class="d-flex justify-space-between mt-4">
        <span class="text-primary text-decoration-underline font-weight-medium">
        </span>

        <v-btn color="success" :loading="loading" :disabled="loading" @click="submitForm">
          {{ $t('t-save') }}
        </v-btn>
      </div>
    </v-card-text>

    <Card elevation="0" :title="$t('t-login-history')">
      <template #title-action>
        <!--<v-btn color="secondary"> All Logout </v-btn>-->
      </template>
      <v-divider />
      <v-card-text>
        <Table :headerItems="productsHeader.map(header => ({
          ...header,
          title: $t('t-' + header.title)
        }))">
          <template #body>
            <tr v-for="(item, index) in loginHistory" :key="'eCommerce-order-item-' + index" height="50">
              <td>
                <i class="ph-device-mobile-camera me-1" /> {{ item.product }}
              </td>
              <td>{{ item.ip_address }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.location }}</td>
              <td>
                <v-btn color="primary" variant="text" class="px-0">
                  {{ $t('t-logout') }} <i class="ph-sign-out ms-1" />
                </v-btn>
              </td>
            </tr>
          </template>
        </Table>
      </v-card-text>
    </Card>
  </Card>
</template>
