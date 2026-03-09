<script lang="ts" setup>
import { ref, computed, watch, PropType } from "vue";
import { useI18n } from "vue-i18n";
import { changePasswordListingType } from "@/components/users/types"
import { normalizeStringValue } from "@/app/common/normalizers";
import { useToast } from "vue-toastification";

const emit = defineEmits(["update:modelValue", "onSubmit"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<changePasswordListingType>,
    required: true,
  },
  error: {
    type: String,
    default: "",
  }
});

const formData = ref(prop.data);
const localLoading = ref(false);
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const toast = useToast();

const id = ref(formData.value.id || "");
const newPassword = ref(formData.value.newPassword || "");
const confirmPassword = ref(formData.value.confirmPassword || "");

const dialogValue = computed({
  get: () => prop.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formErrors = ref<Record<string, string>>({
  newPassword: '',
  confirmPassword: '',
});

const { t } = useI18n();
const requiredRules = {
  newPassword: [(v: string) => !!v?.trim() || t('t-please-enter-password')],
  confirmPassword: [
    (v: string) => !!v?.trim() || t('t-please-enter-password-confirm'),
    (v: string) => (v?.trim() || "") === (newPassword.value?.trim() || "") || t('t-please-enter-same-password-and-password-confirm')
  ]
};

const validateForm = () => {
  let isValid = true;
  
  // Reset errors
  Object.keys(formErrors.value).forEach(key => {
    formErrors.value[key] = '';
  });

  if (!newPassword.value.trim()) {
    formErrors.value.newPassword = t('t-please-enter-password');
    isValid = false;
  }

  if (!confirmPassword.value.trim()) {
    formErrors.value.confirmPassword = t('t-please-enter-password-confirm');
    isValid = false;
  }

  if (newPassword.value.trim() && confirmPassword.value.trim() && newPassword.value.trim() !== confirmPassword.value.trim()) {
    formErrors.value.confirmPassword = t('t-please-enter-same-password-and-password-confirm');
    isValid = false;
  }

  return isValid;
};

async function onSubmit() {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid || !validateForm()) {
    toast.error(t('t-validation-error'));
    return;
  }

  localLoading.value = true;

  emit("onSubmit", {
    newPassword: normalizeStringValue(newPassword.value, "trimToEmpty") || "",
    confirmPassword: normalizeStringValue(confirmPassword.value, "trimToEmpty") || "",
    passwordsMatching: newPassword.value.trim() === confirmPassword.value.trim(),
  }, {
    onSuccess: () => {
      dialogValue.value = false;
    },
    onFinally: () => {
      localLoading.value = false;
    }
  });
}
</script>

<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="$t('t-change-password')" title-class="py-0">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto">
        <v-alert v-if="error" :text="error" type="error" class="mb-4" variant="tonal" color="danger" density="compact" />
        
        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-new-password') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField 
              v-model="newPassword" 
              :placeholder="$t('t-enter-password')" 
              :error-messages="formErrors.newPassword ? [formErrors.newPassword] : []"
              :rules="requiredRules.newPassword"
              isPassword
            />
          </v-col>
          
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-confirm-password') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField 
              v-model="confirmPassword" 
              :placeholder="$t('t-enter-password-confirm')" 
              :error-messages="formErrors.confirmPassword ? [formErrors.confirmPassword] : []"
              :rules="requiredRules.confirmPassword"
              isPassword
            />
          </v-col>
        </v-row>
      </v-card-text>
      
      <v-divider />
      
      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t('t-close') }}
          </v-btn>
          <v-btn 
            color="primary" 
            variant="elevated" 
            @click="onSubmit" 
            :loading="localLoading" 
            :disabled="localLoading"
          >
            {{ localLoading ? $t('t-saving') : $t('t-save') }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
    </v-form>
  </v-dialog>
</template>

<style>
.text-extra-small {
  font-size: 0.70rem;
}
</style>
