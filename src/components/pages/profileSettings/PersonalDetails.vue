<script lang="ts" setup>
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { skillsOptions } from "@/components/pages/profileSettings/utils";
import { ref } from "vue";
import { useAuthStore } from "@/store/authStore";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { watch } from "vue";
import { userService } from "@/app/http/httpServiceProvider";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";



const { t } = useI18n();
const toast = useToast();
const authStore = useAuthStore();
// Para garantir reatividade, usamos storeToRefs
const { user } = storeToRefs(authStore);
const errorMsg = ref("");

const formData = ref({
  fname: "",
  lname: "",
  phone: "",
  email: "",
  dob: "07/19/2000",
  joiningDate: "09/10/2022",
});

onMounted(() => {
  if (user.value) {
    formData.value.fname = user.value.firstName || "";
    formData.value.lname = user.value.lastName || "";
    formData.value.phone = user.value.phone || "";
    formData.value.email = user.value.email || "";
    formData.value.dob = user.value.dob || ""; // valor padrão, se necessário
    formData.value.joiningDate = user.value.createdAt || "";
  }
});

watch(user, (newUser) => {
  if (newUser) {
    formData.value = {
      fname: newUser.firstName || "",
      lname: newUser.lastName || "",
      phone: newUser.phone || "",
      email: newUser.email || "",
      dob: newUser.dob || "",
      joiningDate: newUser.createdAt || "",
    };
  }
}, { immediate: true }); // executa no início também

const onCancel = () => {
  formData.value = {
    fname: "",
    lname: "",
    phone: "",
    email: "",
    dob: "",
    joiningDate: "",
  };
};

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};


let alertTimeout: ReturnType<typeof setTimeout> | null = null;


const handleApiError = (error: any) => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  const message =
    error?.response?.data?.error?.errors?.name?.[0] || // tenta capturar erro por campo
    error?.response?.data?.message ||                  // erro direto da API
    error?.message ||                                  // erro genérico
    t("t-message-save-error");                         // fallback traduzido

  console.error("Erro:", message);
  errorMsg.value = message;

  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000); // 5 seg para erros de API
};


const onSubmit = async () => {
  const showError = (msg: string) => {
    if (alertTimeout) {
      clearTimeout(alertTimeout);
      alertTimeout = null;
    }

    errorMsg.value = msg;

    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 3000); // 3 seg para erros de validação
  };

  // Validação
  if (formData.value.fname.trim() === "") {
    showError(t('t-please-enter-firstname'));
    return;
  }

  if (formData.value.lname.trim() === "") {
    showError(t('t-please-enter-lastname'));
    return;
  }

  if (formData.value.email.trim() === "") {
    showError(t('t-please-enter-email'));
    return;
  } else if (!validateEmail(formData.value.email)) {
    showError(t('t-invalid-email'));
    return;
  }

  // Se passou na validação, limpar errorMsg
  errorMsg.value = "";

  try {
    const updateData = {
      firstName: formData.value.fname,
      lastName: formData.value.lname,
      email: formData.value.email,
    };

    if (!user.value?.id) {
      toast.error('ID do utilizador não encontrado!');
      return;
    }

    await userService.updateUser(user.value.id, updateData);

    const mergedUser = {
      ...user.value,
      ...updateData
    };

    authStore.setUser(mergedUser);

    toast.success(t('t-toast-message-update'));

  } catch (error) {
    console.error("Erro ao atualizar utilizador:", error);
    handleApiError(error);
  }
};

</script>
<template>
  <Card :title="$t('t-personal-details')">
    <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-3 mt-3" density="compact" />
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">{{ $t('t-first-name') }}</div>
          <TextField v-model="formData.fname" placeholder="Enter your first name" hide-details />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">{{ $t('t-last-name') }}</div>
          <TextField v-model="formData.lname" placeholder="Enter your Last name" hide-details />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">{{ $t('t-phone-number') }}</div>
          <TextField v-model="formData.phone" placeholder="Enter your Phone number" hide-details />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">{{ $t('t-email') }}</div>
          <TextField v-model="formData.email" placeholder="Enter your Email address" hide-details />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">{{ $t('t-date-of-birth') }}</div>
          <VueDatePicker v-model="formData.joiningDate" :teleport="true" :enable-time-picker="false" />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">{{ $t('t-joining-date') }}</div>
          <VueDatePicker v-model="formData.joiningDate" :teleport="true" :enable-time-picker="false" />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
      <div>
        <v-btn color="primary" variant="elevated" @click="onSubmit"> {{ $t('t-update') }} </v-btn>

        <v-btn color="danger" variant="tonal" @click="onCancel"> {{ $t('t-cancel') }} </v-btn>
      </div>
    </v-card-actions>
  </Card>
</template>
