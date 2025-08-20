<script lang="ts" setup>
import { PropType, computed, ref, watch } from "vue";
import { DependentInsertType, DependentListingType } from "@/components/employee/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';

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

// Form fields
const id = ref("");
const firstName = ref("");
const middleName = ref("");
const lastName = ref("");
const gender = ref("");
const birthDate = ref<Date | undefined>();
const relationship = ref("");
const employee = ref<string | { id: string; employeeNumber: string; firstName: string; lastName: string; }>("");
const idCardNumber = ref("");
const idCardIssuer = ref("");
const idCardExpiryDate = ref<Date | undefined>();
const idCardIssuanceDate = ref<Date | undefined>();
const enabled = ref(true);

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
  ],
  idCardIssuanceDate: [
    (v: Date | string | null) => !!v || t('t-please-enter-id-card-issuance-date'),
  ]

};

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const toast = useToast();

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();

  if (!valid) {
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
    employee: typeof employee.value === 'string'
      ? employee.value
      : employee.value?.id ?? "",
    idCardNumber: idCardNumber.value,
    idCardIssuer: idCardIssuer.value,
    idCardExpiryDate: idCardExpiryDate.value,
    idCardIssuanceDate: idCardIssuanceDate.value,
    enabled: enabled.value
  };

  emit("onSubmit", payload, {
    onSuccess: () => dialogValue.value = false,
    onFinally: () => localLoading.value = false
  });
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-dependent') : $t('t-edit-dependent')" title-class="py-0"
        style="overflow: hidden">
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
              <TextField v-model="firstName" :placeholder="$t('t-enter-firstname')" :rules="requiredRules.firstName" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-middle-name') }}
              </div>
              <TextField v-model="middleName" :placeholder="$t('t-enter-middle-name')" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-lastname') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="lastName" :placeholder="$t('t-enter-lastname')" :rules="requiredRules.lastName" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-relationship') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="relationship" :items="relationshipOptions" :rules="requiredRules.relationship" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-gender') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="gender" :items="genderOptions" :rules="requiredRules.gender" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-birth-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <ValidatedDatePicker ref="birthDatePicker" v-model="birthDate" :teleport="true"
                :placeholder="$t('t-enter-birth-date')" :rules="requiredRules.birthDate" format="dd/MM/yyyy" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-number') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="idCardNumber" :placeholder="$t('t-enter-id-card-number')"
                :rules="requiredRules.idCardNumber" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-issuer') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="idCardIssuer" :placeholder="$t('t-enter-id-card-issuer')"
                :rules="requiredRules.idCardIssuer" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-expiry-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <ValidatedDatePicker ref="idCardExpiryDatePicker" v-model="idCardExpiryDate" :teleport="true"
                :placeholder="$t('t-enter-id-card-expiry-date')" :rules="requiredRules.idCardExpiryDate"
                format="dd/MM/yyyy" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-issuance-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <ValidatedDatePicker ref="idCardIssuanceDatePicker" v-model="idCardIssuanceDate" :teleport="true"
                :placeholder="$t('t-enter-id-card-issuance-date')" :rules="requiredRules.idCardIssuanceDate"
                format="dd/MM/yyyy" />
            </v-col>
          </v-row>
          <v-row class="mt-">
            <v-col cols="12" lg="12" class="">
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
