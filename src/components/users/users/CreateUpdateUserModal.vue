<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { UserInsertType } from "@/components/users/types";
import { statusOptions } from "@/components/realEstate/agent/utils";
import { colors } from "@/components/ui/utils";
import { useI18n } from "vue-i18n";


const localLoading = ref(false);
const emit = defineEmits(["update:modelValue", "onSubmit"]);
const errorMsg = ref("");

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<UserInsertType>,
    required: true,
  },
});


const isCreate = computed(() => prop.data.id === -1);
const formData = ref(prop.data);

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
}); 

const id =  ref(formData.value.id || "");
const firstName = ref(formData.value.firstName || ""); 
const lastName = ref(formData.value.lastName || "");
const email = ref(formData.value.email || "");
//const enable = ref(formData.value.enable || true);

// Remove as refs de password se  for criação
const password = ref<{ value: string; isValid: boolean }>({ value: '', isValid: false });
const password_confirm = ref<{ value: string; isValid: boolean }>({ value: '', isValid: false });



const { t } = useI18n();

//validate functions
const validatePassword = () => {
  if (!isCreate.value) return true;

  const pwd = password.value.value.trim();
  const pwdConfirm = password_confirm.value.value.trim();

  console.log("Validating password:", pwd, pwdConfirm);

  if (pwd !== pwdConfirm) {
    errorMsg.value = t('t-please-enter-same-password-and-password-confirm');
    return false;
  }

  return true;
};


const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};


const onSubmit = () => {

//Validações Gerais

  if (firstName.value === '') {
    errorMsg.value = t('t-please-enter-firstname');
    setTimeout(() => errorMsg.value = "", 3000);
    return;
  }

  if (email.value === '') {
    errorMsg.value = t('t-please-enter-email');
    setTimeout(() => errorMsg.value = "", 3000);
    return;
  }
  else if (!validateEmail(email.value)) {
    errorMsg.value = t('t-invalid-email');
    setTimeout(() => errorMsg.value = "", 3000);
    return;
  }



  // Validações específicas para criação
  if (isCreate.value) {
    if (!password.value) {
      errorMsg.value = t('t-please-enter-password');
      setTimeout(() => errorMsg.value = "", 3000);
      return;
    } else if (!password_confirm.value) {
      errorMsg.value = t('t-please-enter-password-confirm');
      setTimeout(() => errorMsg.value = "", 3000);
      return;
    } 
    
    if (!validatePassword()) {
      setTimeout(() => errorMsg.value = "", 3000);
      return;
    }
  }

  //tempo para mostrar a mensagem de erro
  /*setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (
    !firstName.value ||
    !username.value ||
    !email.value ||
    !password.value ||
    !password_confirm.value
  ) {
    return;
  }*/

  errorMsg.value = "";

  /*const data = {
    ...prop.data,
    firstname: firstname.value,
    lastname: lastname.value,
    email: email.value,
    username: username.value,
    password: password.value,
    password_confirm: password_confirm.value,
    enable: enable.value
  };*/

  localLoading.value = true;

  const data = {
    ...(!isCreate.value && { id: id.value }),// Apenas inclui password se for update
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
      ...(isCreate.value && {
        password: password.value.value,
        password_confirm: password_confirm.value.value
      }),
    //enable: enable.value
  };

  //console.log('data',data);

  //emit("onSubmit", data);

  emit('onSubmit', data, {
    onSuccess: () => {
      dialogValue.value = false; // Fecha a modal
    },
    onFinally: () => {
      localLoading.value = false; // Sempre desativa o loading
    }
  });

};
</script>
<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <Card :title="isCreate ? $t('t-add-user') : $t('t-edit-user')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />
      <v-card-text class="overflow-y-auto" :style="{ 
      'max-height': isCreate ? '70vh' : '45vh' 
    }">
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-firstname') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="firstName" :placeholder="$t('t-enter-firstname')" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-lastname') }}
            </div>
            <TextField v-model="lastName" :placeholder="$t('t-enter-lastname')" />
          </v-col>
        </v-row>
        <div class="font-weight-bold text-caption mb-1">
          {{ $t('t-email') }} <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="email" !isEmail :placeholder="$t('t-enter-email-form')" />
        <v-row v-if="isCreate">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption  mb-1">
              {{ $t('t-password') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="password" hide-details isRequired isPassword :placeholder="$t('t-enter-password')" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption  mb-1">
              {{ $t('t-confirm-password') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="password_confirm" hide-details isRequired isPassword
              :placeholder="$t('t-enter-password-confirm')" />
          </v-col>
        </v-row>

        <!--<div class="font-weight-bold text-caption mt-3">
          {{ $t('t-status') }} <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <v-checkbox :model-value="enable" label="Default Checkbox" hide-details color="primary" density="compact">
          <template #label><span>{{ $t('t-active') }}</span></template>
        </v-checkbox>-->
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t('t-close') }} 
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t('t-saving') : $t('t-save')  }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
