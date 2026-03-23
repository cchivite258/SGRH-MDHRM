<script lang="ts" setup>
import { PropType, computed, ref, watch, nextTick } from "vue";
import { DependentInsertType, DependentListingType } from "@/components/employee/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiValidationErrors, getFirstApiErrorMessage } from "@/app/common/apiErrors";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue", "onSubmit"]);

// Utils
import {
  genderOptions,
  relationshipOptions
} from "@/components/employee/create/utils";

// Components
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // No CreateEditDependentDialog.vue
  data: {
    type: Object as PropType<DependentInsertType | DependentListingType | null>,
    required: false,
    default: () => ({
      id: undefined,
      firstName: "",
      middleName: "",
      gender: "",
      birthDate: undefined,
      relationship: "",
      isUnivesityStudent: false,
      employee: "",
      idCardNumber: "",
      idCardIssuer: "",
      idCardExpiryDate: undefined,
      idCardIssuanceDate: undefined,
      enabled: true
    })
  },
});

const localLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});

// Form fields
const id = ref("");
const firstName = ref("");
const middleName = ref("");
const lastName = ref("");
const gender = ref("");
const birthDate = ref<Date | undefined>();
const relationship = ref("");
const isUnivesityStudent = ref(false);
const employee = ref<string | { id: string; employeeNumber: string; firstName: string; lastName: string; }>("");
const idCardNumber = ref("");
const idCardIssuer = ref("");
const idCardExpiryDate = ref<Date | undefined>();
const idCardIssuanceDate = ref<Date | undefined>();
const enabled = ref(true);
const birthDatePicker = ref();
const idCardExpiryDatePicker = ref();
const idCardIssuanceDatePicker = ref();

// Watch for data changes
watch(() => props.data, (newData) => {
  if (!newData) return;
  id.value = newData.id || "";
  firstName.value = newData.firstName || "";
  middleName.value = newData.middleName || "";
  lastName.value = newData.lastName || "";
  gender.value = newData.gender || "";
  birthDate.value = newData.birthDate ? new Date(newData.birthDate) : undefined;
  relationship.value = newData.relationship || "";
  isUnivesityStudent.value = !!newData.isUnivesityStudent;
  employee.value = typeof newData.employee === 'string'
    ? newData.employee
    : newData.employee
      ? { ...newData.employee }
      : "";
  idCardNumber.value = newData.idCardNumber || "";
  idCardIssuer.value = newData.idCardIssuer || "";
  idCardExpiryDate.value = newData.idCardExpiryDate ? new Date(newData.idCardExpiryDate) : undefined;
  idCardIssuanceDate.value = newData.idCardIssuanceDate ? new Date(newData.idCardIssuanceDate) : undefined;
  enabled.value = newData.enabled !== undefined ? newData.enabled : true;
}, { immediate: true });


const isCreate = computed(() => !id.value);

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

/**
 * Regras de validação para os campos do formulário
 */
const requiredRules = {
  firstName: [
    (v: string) => !!v || t('t-please-enter-firstname'),
  ],
  lastName: [
    (v: string) => !!v || t('t-please-enter-lastname'),
  ],
  gender: [
    (v: string) => !!v || t('t-please-enter-email-address'),
  ],
  birthDate: [
    (v: Date | string | null) => !!v || t('t-please-enter-birth-date'),
  ],
  relationship: [
    (v: string) => !!v || t('t-please-enter-relationship'),
  ],
  idCardNumber: [
    (v: string) => !!v || t('t-please-enter-id-card-number'),
  ],
  idCardIssuer: [
    (v: string) => !!v || t('t-please-enter-id-card-issuer'),
  ],
  idCardExpiryDate: [
    (v: Date | string | null) => !!v || t('t-please-enter-id-card-expiry-date'),
    (v: Date | string | null) => {
      if (!v) return true;
      const expiryDate = new Date(v);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) return t('t-invalid-id-card-expiry-date');
      if (idCardIssuanceDate.value) {
        const issuanceDate = new Date(idCardIssuanceDate.value);
        if (expiryDate <= issuanceDate) return t('t-invalid-id-card-expiry-date');
      }
      return true;
    }
  ],
  idCardIssuanceDate: [
    (v: Date | string | null) => !!v || t('t-please-enter-id-card-issuance-date'),
    (v: Date | string | null) => {
      if (!v) return true;
      const issuanceDate = new Date(v);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (issuanceDate > today) return t('t-invalid-id-card-issuance-date');
      if (idCardExpiryDate.value) {
        const expiryDate = new Date(idCardExpiryDate.value);
        if (issuanceDate >= expiryDate) return t('t-invalid-id-card-issuance-date');
      }
      return true;
    }
  ]

};

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const toast = useToast();
const getServerErrors = (field: string) => serverErrors.value[field] || [];
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => [
  ...rules,
  (value: any) => {
    const hasFrontendError = rules.some((rule) => rule(value) !== true);
    if (hasFrontendError) return true;
    return getServerErrors(field)[0] || true;
  }
];

watch(serverErrors, async (errors) => {
  if (Object.keys(errors).length > 0) {
    await nextTick();
    await form.value?.validate();
  }
}, { deep: true });

watch(firstName, () => delete serverErrors.value.firstName);
watch(middleName, () => delete serverErrors.value.middleName);
watch(lastName, () => delete serverErrors.value.lastName);
watch(gender, () => delete serverErrors.value.gender);
watch(birthDate, () => delete serverErrors.value.birthDate);
watch(relationship, () => delete serverErrors.value.relationship);
watch(isUnivesityStudent, () => delete serverErrors.value.isUnivesityStudent);
watch(idCardNumber, () => delete serverErrors.value.idCardNumber);
watch(idCardIssuer, () => delete serverErrors.value.idCardIssuer);
watch(idCardExpiryDate, () => delete serverErrors.value.idCardExpiryDate);
watch(idCardIssuanceDate, () => delete serverErrors.value.idCardIssuanceDate);

const onSubmit = async () => {
  if (!form.value) return;
  serverErrors.value = {};
  const isBirthDateValid = birthDatePicker.value?.validate?.() ?? true;
  const isIdCardExpiryDateValid = idCardExpiryDatePicker.value?.validate?.() ?? true;
  const isIdCardIssuanceDateValid = idCardIssuanceDatePicker.value?.validate?.() ?? true;

  const { valid } = await form.value.validate();

  if (!valid || !isBirthDateValid || !isIdCardExpiryDateValid || !isIdCardIssuanceDateValid) {
    toast.error(t('t-validation-error'));
    errorMsg.value = t('t-please-correct-errors');
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return;
  }

  localLoading.value = true;

  const payload: DependentInsertType = {
    id: id.value || undefined,
    firstName: firstName.value,
    middleName: middleName.value,
    lastName: lastName.value,
    gender: gender.value,
    birthDate: birthDate.value,
    relationship: relationship.value,
    isUnivesityStudent: isUnivesityStudent.value,
    employee: typeof employee.value === 'string'
      ? employee.value
      : employee.value?.id ?? "",
    idCardNumber: idCardNumber.value,
    idCardIssuer: idCardIssuer.value,
    idCardExpiryDate: idCardExpiryDate.value,
    idCardIssuanceDate: idCardIssuanceDate.value,
    enabled: enabled.value
  };
  normalizeObjectStringFieldsInPlace(payload as Record<string, any>, {
    firstName: "trimToEmpty",
    middleName: "trimToNull",
    lastName: "trimToEmpty",
    idCardNumber: "trimToEmpty",
    idCardIssuer: "trimToEmpty"
  });

  emit("onSubmit", payload, {
    onSuccess: () => dialogValue.value = false,
    onError: (error: { error?: ApiErrorResponse }) => {
      serverErrors.value = getApiValidationErrors(error);
      const message = getFirstApiErrorMessage(error, t('t-message-save-error')) || t('t-message-save-error');
      toast.error(message);
      if (Object.keys(serverErrors.value).length === 0) {
        errorMsg.value = message;
      } else {
        errorMsg.value = "";
      }
      alertTimeout = setTimeout(() => {
        errorMsg.value = "";
        alertTimeout = null;
      }, 5000);
    },
    onFinally: () => localLoading.value = false
  });
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="700">
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-dependent') : $t('t-edit-dependent')" title-class="py-0"
        style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />
        <v-card-text class="overflow-y-auto" style="max-height: 70vh">
          <v-row class="">
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-firstname') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="firstName" :placeholder="$t('t-enter-firstname')"
                :rules="applyServerErrorsToRules('firstName', requiredRules.firstName)" />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-middle-name') }}
              </div>
              <TextField v-model="middleName" :placeholder="$t('t-enter-middle-name')" />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-lastname') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="lastName" :placeholder="$t('t-enter-lastname')"
                :rules="applyServerErrorsToRules('lastName', requiredRules.lastName)" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-relationship') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="relationship" :items="relationshipOptions"
                :rules="requiredRules.relationship" :error-messages="getServerErrors('relationship')" />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-gender') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="gender" :items="genderOptions" :rules="requiredRules.gender"
                :error-messages="getServerErrors('gender')" />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-birth-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <ValidatedDatePicker ref="birthDatePicker" v-model="birthDate" :placeholder="$t('t-enter-birth-date')"
                :rules="applyServerErrorsToRules('birthDate', requiredRules.birthDate)" format="dd/MM/yyyy" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-number') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="idCardNumber" :placeholder="$t('t-enter-id-card-number')"
                :rules="applyServerErrorsToRules('idCardNumber', requiredRules.idCardNumber)" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-issuer') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="idCardIssuer" :placeholder="$t('t-enter-id-card-issuer')"
                :rules="applyServerErrorsToRules('idCardIssuer', requiredRules.idCardIssuer)" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-expiry-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <ValidatedDatePicker ref="idCardExpiryDatePicker" v-model="idCardExpiryDate"
                :placeholder="$t('t-enter-id-card-expiry-date')"
                :rules="applyServerErrorsToRules('idCardExpiryDate', requiredRules.idCardExpiryDate)"
                format="dd/MM/yyyy" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-issuance-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <ValidatedDatePicker ref="idCardIssuanceDatePicker" v-model="idCardIssuanceDate"
                :placeholder="$t('t-enter-id-card-issuance-date')"
                :rules="applyServerErrorsToRules('idCardIssuanceDate', requiredRules.idCardIssuanceDate)"
                format="dd/MM/yyyy" />
            </v-col>
          </v-row>
          <v-row class="mt-0">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold">{{ $t('t-university-student') }}</div>
              <v-checkbox v-model="isUnivesityStudent" density="compact" color="primary" class="d-inline-flex">
                <template #label>
                  <span>{{ $t('t-is-university-student') }}</span>
                </template>
              </v-checkbox>
            </v-col>
            <v-col cols="12" lg="6" class="">
              <div class="font-weight-bold">{{ $t('t-enabled') }}</div>
              <v-checkbox v-model="enabled" density="compact" color="primary" class="d-inline-flex">
                <template #label>
                  <span>{{ $t('t-is-enabled') }}</span>
                </template>
              </v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <div>
            <v-btn color="danger" class="me-1" @click="dialogValue = false">
              <i class="ph-x me-1" /> {{ $t('t-close') }}
            </v-btn>
            <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading"
              :disabled="localLoading">
              {{ localLoading ? $t('t-saving') : $t('t-save') }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
