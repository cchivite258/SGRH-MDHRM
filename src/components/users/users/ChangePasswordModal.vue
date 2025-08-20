<script lang="ts" setup>
import { ref, computed, watch, PropType } from "vue";
import { useI18n } from "vue-i18n";
import { changePasswordListingType } from "@/components/users/types"

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

const validateForm = () => {
  let isValid = true;
  
  // Reset errors
  Object.keys(formErrors.value).forEach(key => {
    formErrors.value[key] = '';
  });

  if (!newPassword.value) {
    formErrors.value.newPassword = t('t-field-required');
    isValid = false;
  }

  if (!confirmPassword.value) {
    formErrors.value.confirmPassword = t('t-field-required');
    isValid = false;
  } 

  return isValid;
};

function onSubmit() {
  if (!validateForm()) return;

  localLoading.value = true;

  emit("onSubmit", {
    newPassword: newPassword.value,
    confirmPassword: confirmPassword.value,
    passwordsMatching: newPassword.value === confirmPassword.value,
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
              hide-details
              isPassword
            />
            <div v-if="formErrors.newPassword" class="text-red text-extra-small pt-1">
              {{ formErrors.newPassword }}
            </div>
          </v-col>
          
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-confirm-password') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField 
              v-model="confirmPassword" 
              :placeholder="$t('t-enter-password-confirm')" 
              :error-messages="formErrors.confirmPassword ? [formErrors.confirmPassword] : []"
              hide-details
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
  </v-dialog>
</template>

<style>
.text-extra-small {
  font-size: 0.70rem;
}
</style>