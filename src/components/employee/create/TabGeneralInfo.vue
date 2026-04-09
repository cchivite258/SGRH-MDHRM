<script lang="ts" setup>
/**
 * TabGeneralInfo - Componente para informações gerais do employee 
 * 
 * Contém:
 * - Dados pessoais
 * - Documentos
 * - Contatos
 * - Endereço
 */

import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';

// Components
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";

// Stores
import { useEmployeeStore } from '@/store/employee/employeeStore';
import { useCountryStore } from '@/store/baseTables/countryStore';
import { useProvinceStore } from '@/store/baseTables/countryStore';

// Types
import { CountryListingType } from "@/components/baseTables/country/types"
import { ProvinceListingType } from "@/components/baseTables/province/types"
import { EmployeeInsertType } from "../types";

// Utils
import {
  genderOptions,
  maritalStatusOptions,
  bloodGroupOptions,
  nationalityOptions
} from "@/components/employee/create/utils";

// Configuração inicial
const { t } = useI18n();
const toast = useToast();
const router = useRouter();

// Emits e Props
const emit = defineEmits<{
  (e: 'onStepChange', step: number): void;
  (e: 'save', payload: EmployeeInsertType): void;
  (e: 'update:modelValue', value: EmployeeInsertType): void;
  (e: 'clear-server-error', field: string): void;
  (e: 'validated'): void;
}>();

const props = defineProps({
  modelValue: {
    type: Object as () => EmployeeInsertType,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  serverErrors: {
    type: Object as () => Record<string, string[]>,
    default: () => ({})
  }
});

// Stores
const employeeStore = useEmployeeStore();
const countryStore = useCountryStore();
const provinceStore = useProvinceStore();

// Referências do formulário
const birthDatePicker = ref();
const idCardIssuanceDatePicker = ref();
const idCardExpiryDatePicker = ref();
const form = ref<{
  validate: () => Promise<{ valid: boolean }>;
  resetValidation: () => void;
} | null>(null);

// Dados computados do employee
let employeeData = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

// Estado da UI
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const getServerErrors = (field: string) => props.serverErrors?.[field] || [];
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => [
  ...rules,
  (value: any) => {
    const hasFrontendError = rules.some((rule) => rule(value) !== true);
    if (hasFrontendError) return true;
    return getServerErrors(field)[0] || true;
  }
];

watch(
  () => props.serverErrors,
  async (errors) => {
    if (errors && Object.keys(errors).length > 0) {
      await nextTick();
      await form.value?.validate();
    }
  },
  { deep: true }
);

watch(() => employeeData.value.employeeNumber, () => emit('clear-server-error', 'employeeNumber'));
watch(() => employeeData.value.firstName, () => emit('clear-server-error', 'firstName'));
watch(() => employeeData.value.lastName, () => emit('clear-server-error', 'lastName'));
watch(() => employeeData.value.gender, () => emit('clear-server-error', 'gender'));
watch(() => employeeData.value.birthDate, () => emit('clear-server-error', 'birthDate'));
watch(() => employeeData.value.idCardNumber, () => emit('clear-server-error', 'idCardNumber'));
watch(() => employeeData.value.idCardIssuer, () => emit('clear-server-error', 'idCardIssuer'));
watch(() => employeeData.value.idCardExpiryDate, () => emit('clear-server-error', 'idCardExpiryDate'));
watch(() => employeeData.value.idCardIssuanceDate, () => emit('clear-server-error', 'idCardIssuanceDate'));
watch(() => employeeData.value.isLifeTimeCard, (isLifeTimeCard, previousValue) => {
  emit('clear-server-error', 'isLifeTimeCard');
  if (isLifeTimeCard && !previousValue) {
    employeeData.value.idCardExpiryDate = undefined;
    emit('clear-server-error', 'idCardExpiryDate');
  }
});
watch(() => employeeData.value.email, () => emit('clear-server-error', 'email'));

/**
 * Regras de validação para os campos do formulário
 */
const requiredRules = {
  employeeNumber: [
    (v: string) => !!v || t('t-please-enter-employee-number'),
    (v: string) => (v && v.length <= 20) || t('t-please-enter-maximum-20-characters'),
  ],
  firstName: [
    (v: string) => !!v || t('t-please-enter-employee-firstname'),
  ],
  lastName: [
    (v: string) => !!v || t('t-please-enter-lastname'),
  ],
  idCardNumber: [
    (v: string) => !!v || t('t-please-enter-id-card-number'),
    (v: string) => (v && v.length <= 30) || t('t-maximum-30-characters'),
  ],
  gender: [
    (v: string) => !!v || t('t-please-select-gender'),
  ],
  maritalStatus: [
    (v: string) => !!v || t('t-please-select-marital-status'),
  ],
  birthDate: [
    (v: Date | string | null) => !!v || t('t-please-enter-birth-date'),
    (v: Date | string | null) => {
      if (!v) return true;

      // Converter para Date se for string
      const date = v instanceof Date ? v : new Date(v);
      const today = new Date();

      // Validação de idade máxima (120 anos)
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 120);
      if (date < minDate) return t('t-birth-date-too-old');

      // Validação de idade mínima (18 anos)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - 18);
      if (date > maxDate) return t('t-must-be-over-18');

      return true;
    }
  ],
  idCardIssuer: [
    (v: string) => !!v || t('t-please-enter-id-card-issuer'),
    (v: string) => (v && v.length <= 50) || t('t-maximum-50-characters'),
  ],
  idCardExpiryDate: [
    (v: Date | string) => employeeData.value.isLifeTimeCard || !!v || t('t-please-enter-id-card-expiry-date'),
    (v: Date | string) => {
      if (employeeData.value.isLifeTimeCard) return true;
      if (!v) return true;
      const date = new Date(v);
      const minDate = new Date();
      return date >= minDate || t('t-invalid-id-card-expiry-date');
    }
  ],
  idCardIssuanceDate: [
    (v: Date | string) => !!v || t('t-please-enter-id-card-issuance-date'),
    (v: Date | string) => {
      if (!v) return true;
      const date = new Date(v);
      const minDate = new Date();
      return date <= minDate || t('t-invalid-id-card-issuance-date');
    }
  ],
  email: [
    (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || t('t-invalid-email'),
  ],
}

/**
 * Opções para selects (países e províncias)
 */
const countries = computed(() => {
  return countryStore.countries.map((country: CountryListingType) => ({
    value: country.id,
    label: country.name,
    meta: {
      code: country.iso2Code,
      phoneCode: country.phoneCode
    }
  }));
});

const provinces = computed(() => {
  return (provinceStore.provincesbyCountry as ProvinceListingType[]).map((province) => ({
    value: province.id,
    label: province.name,
    meta: {
      code: province.code,
      country: province.country
    }
  }));
});


/**
 * Carrega dados iniciais quando o componente é montado
 */
onMounted(async () => {
  try {
    await countryStore.fetchCountries();

    // Carrega províncias se já houver país selecionado
    if (employeeData.value.country) {
      await provinceStore.fetchProvincesbyCountry(employeeData.value.country);
    }
  } catch (error) {
    console.error("Failed to load countries:", error);
    errorMsg.value = "Falha ao carregar países";
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
  }
});

/**
 * Observa mudanças no país para carregar as províncias correspondentes
 */
watch(() => employeeData.value.country, async (newCountryId, oldCountryId) => {
  // Só executa se o país realmente mudou
  if (newCountryId !== oldCountryId) {
    if (newCountryId) {
      try { 
        await provinceStore.fetchProvincesbyCountry(newCountryId);

        // Mantém a província atual apenas se for do mesmo país
        if (employeeData.value.province) {
          const currentProvince = provinceStore.provincesbyCountry.find(
            p => p.id === employeeData.value.province
          );
          if (!currentProvince) {
            employeeData.value.province = undefined;
          }
        } else {
          employeeData.value.province = undefined;
        }
      } catch (error) {
        console.error("Failed to load provinces:", error);
        provinceStore.provincesbyCountry = [];
        employeeData.value.province = undefined;
        errorMsg.value = "Falha ao carregar províncias";
        alertTimeout = setTimeout(() => {
          errorMsg.value = "";
          alertTimeout = null;
        }, 5000);
      }
    } else {
      provinceStore.clearProvinces();
      employeeData.value.province = undefined;
    }
  }
});

/**
 * Volta para a lista de employees
 */
const onBack = () => {
  router.push({ path: `/employee/list` });
};

/**
 * Valida e envia o formulário
 */
// Atualize o submitForm para usar as refs
const submitForm = async () => {
  if (!form.value) return;

  try {
    // Forçar validação dos date pickers
    await birthDatePicker.value?.validate();
    await idCardIssuanceDatePicker.value?.validate();
    if (!employeeData.value.isLifeTimeCard) {
      await idCardExpiryDatePicker.value?.validate();
    }

    // Resto da validação...
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

    emit('validated');
    emit('onStepChange', 2);

  } catch (error) {
    console.error("Validation error:", error);
    errorMsg.value = t('t-validation-error');
  }
}

</script>

<template>
  <v-form ref="form" @submit.prevent="submitForm">
    <Card :title="$t('t-general-information')" elevation="0" title-class="pb-0">
      <!-- Mensagem de erro -->
      <transition name="fade">
        <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-5 mt-3" variant="tonal" color="danger"
          density="compact" @click="errorMsg = ''" style="cursor: pointer;" />
      </transition>

      <v-card-text class="pt-0">
        <v-row class="mt-n9">
          <v-col cols="12" lg="12" class="text-right">
            <div class="font-weight-bold">{{ $t('t-availability') }}</div>
            <v-checkbox v-model="employeeData.enabled" density="compact" color="primary" class="d-inline-flex">
              <template #label>
                <span>{{ $t('t-is-enabled') }}</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>
        <!-- Seção: Informações básicas -->
        <v-row class="mt-n12">
          <v-col cols="12" lg="12">
            <div class="font-weight-bold mb-2 mt-5">
              {{ $t('t-employeeNumber') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="employeeData.employeeNumber" :placeholder="$t('t-enter-employee-number')"
              :rules="applyServerErrorsToRules('employeeNumber', requiredRules.employeeNumber)" />
          </v-col>
        </v-row>
        <!-- Nome completo -->
        <v-row class="mt-n3">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-firstname') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="employeeData.firstName" :placeholder="$t('t-enter-employee-number')"
              :rules="applyServerErrorsToRules('firstName', requiredRules.firstName)" />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-middle-name') }}
            </div>
            <TextField v-model="employeeData.middleName" :placeholder="$t('t-enter-middle-name')" />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-lastname') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="employeeData.lastName" :placeholder="$t('t-enter-lastname')"
              :rules="applyServerErrorsToRules('lastName', requiredRules.lastName)" />
          </v-col>
        </v-row>

        <!-- Dados pessoais -->
        <v-row class="mt-n6">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-gender') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="employeeData.gender" :items="genderOptions" :rules="requiredRules.gender"
              :error-messages="getServerErrors('gender')" />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-marital-status') }}
            </div>
            <MenuSelect v-model="employeeData.maritalStatus" :items="maritalStatusOptions" />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-blood-group') }}
            </div>
            <MenuSelect v-model="employeeData.bloodGroup" :items="bloodGroupOptions" />
          </v-col>
        </v-row>

        <!-- Data de nascimento e local -->
        <v-row class="mt-n3">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-birth-date') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <ValidatedDatePicker ref="birthDatePicker" v-model="employeeData.birthDate" :teleport="true"
              :placeholder="$t('t-enter-birth-date')" :rules="applyServerErrorsToRules('birthDate', requiredRules.birthDate)"
              format="dd/MM/yyyy" />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-place-of-birth') }}
            </div>
            <TextField v-model="employeeData.placeOfBirth" :placeholder="$t('t-enter-place-of-birth')" hide-details />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-nacionality') }}
            </div>
            <MenuSelect v-model="employeeData.nationality" :items="nationalityOptions" /> 
          </v-col>
        </v-row>

        <!-- Documentos -->
        <v-row class="mt-n6">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-nuit') }}
            </div>
            <TextField v-model="employeeData.incomeTaxNumber" :placeholder="$t('t-enter-nuit')" hide-details />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-social-security-number') }}
            </div>
            <TextField v-model="employeeData.socialSecurityNumber" :placeholder="$t('t-enter-social-security-number')"
              hide-details />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-address') }}
            </div>
            <TextField v-model="employeeData.address" :placeholder="$t('t-enter-address')" hide-details />
          </v-col>
        </v-row>

        <!-- País e Província -->
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-country') }}
            </div>
            <MenuSelect v-model="employeeData.country" :items="countries" :loading="countryStore.loading" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-province') }}
            </div>
            <MenuSelect v-model="employeeData.province" :items="provinces" :loading="provinceStore.loading"
              :disabled="!employeeData.country || !Array.isArray(provinceStore.provincesbyCountry)" />
          </v-col>
        </v-row>

        <!-- Código postal e contatos -->
        <v-row class="mt-n6">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-postal-code') }}
            </div>
            <TextField v-model="employeeData.postalCode" :placeholder="$t('t-enter-postal-code')" hide-details />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-email') }}
            </div>
            <TextField v-model="employeeData.email" :placeholder="$t('t-enter-email')" hide-details
              :rules="applyServerErrorsToRules('email', requiredRules.email)" />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-phone') }}
            </div>
            <MazPhoneNumberInput v-model="employeeData.phone" size="sm" fetchCountry
              :placeholder="$t('t-enter-phone-number')" class="custom-phone-input" />
          </v-col>
        </v-row>

        <!-- Contatos adicionais -->
        <v-row class="">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-mobile') }}
            </div>
            <MazPhoneNumberInput v-model="employeeData.mobile" size="sm" :placeholder="$t('t-enter-phone-number')"
              fetchCountry class="custom-phone-input" />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-emergency-contact-name') }}
            </div>
            <TextField v-model="employeeData.emergencyContactName" :placeholder="$t('t-enter-phone-number')"
              hide-details />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-emergency-contact-phone') }}
            </div>
            <MazPhoneNumberInput v-model="employeeData.emergencyContactPhone" size="sm"
              :placeholder="$t('t-enter-phone-number')" fetchCountry class="custom-phone-input" />
          </v-col>
        </v-row>

        <!-- Documentos de identificação -->
        <v-row class="">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-id-card-number') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="employeeData.idCardNumber" :placeholder="$t('t-id-card-number')"
              :rules="applyServerErrorsToRules('idCardNumber', requiredRules.idCardNumber)" />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-id-card-issuer') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="employeeData.idCardIssuer" :placeholder="$t('t-enter-id-card-issuer')"
              :rules="applyServerErrorsToRules('idCardIssuer', requiredRules.idCardIssuer)" />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-is-lifetime-id-card') }}
            </div>
            <v-checkbox v-model="employeeData.isLifeTimeCard" density="compact" color="primary" hide-details>
              <template #label>
                <span>{{ $t('t-is-lifetime-id-card') }}</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-id-card-issuance-date') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <ValidatedDatePicker ref="idCardIssuanceDatePicker" v-model="employeeData.idCardIssuanceDate"
              :teleport="true" :rules="applyServerErrorsToRules('idCardIssuanceDate', requiredRules.idCardIssuanceDate)"
              :placeholder="$t('t-enter-id-card-issuance-date')" format="dd/MM/yyyy" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-id-card-expiry-date') }} <i v-if="!employeeData.isLifeTimeCard" class="ph-asterisk ph-xs text-danger" />
            </div>
            <ValidatedDatePicker ref="idCardExpiryDatePicker" v-model="employeeData.idCardExpiryDate" :teleport="true"
              :rules="applyServerErrorsToRules('idCardExpiryDate', requiredRules.idCardExpiryDate)"
              :placeholder="$t('t-enter-id-card-expiry-date')" format="dd/MM/yyyy"
              :disabled="employeeData.isLifeTimeCard" />
          </v-col>
        </v-row>

        <!-- Datas de emissão de documentos -->
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-passport-number') }}
            </div>
            <TextField v-model="employeeData.passportNumber" :placeholder="$t('t-enter-passport-number')"
              hide-details />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-passport-issuer') }}
            </div>
            <TextField v-model="employeeData.passportIssuer" :placeholder="$t('t-enter-passport-issuer')"
              hide-details />
          </v-col>
        </v-row>

        <!-- Datas de passaporte -->
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-passport-issuance-date') }}
            </div>
            <VueDatePicker v-model="employeeData.passportIssuanceDate" :teleport="true"
              :placeholder="$t('t-enter-passport-issuance-date')" :enable-time-picker="false" format="dd/MM/yyyy" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-id-passport-expiry-date') }}
            </div>
            <VueDatePicker v-model="employeeData.passportExpiryDate" :teleport="true"
              :placeholder="$t('t-enter-id-passport-expiry-date')" :enable-time-picker="false" format="dd/MM/yyyy" />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Ações do formulário -->
      <v-card-actions class="d-flex justify-space-between mt-3">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack()" :disabled="loading">
          {{ $t('t-back') }} <i class="ph-arrow-left ms-2" />
        </v-btn>

        <v-btn color="success" variant="elevated" @click="submitForm" :loading="loading">
          {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
        </v-btn>
      </v-card-actions>
    </Card>
  </v-form>
</template>

<style scoped>
/* Estilos consistentes com o index.vue */
:deep(.dp__input) {
  height: 2.63rem;
}

.custom-phone-input {
  background-color: #fff;
  border: 1px solid #DDE1EF;
  border-radius: 3px;
  padding: 0;
  color: #ABABAB !important;
}

:deep(.m-input.--has-label .m-input-input) {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 0.8rem !important;
}

:deep(.m-input.--sm .m-input-input),
:deep(.m-input.--sm .m-input-label) {
  font-size: 0.8rem !important;
  color: #ABABAB !important;
}

:deep(.m-input-input::placeholder) {
  font-size: 0.75rem !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
  animation: progressBar 5s linear forwards;
}

@keyframes progressBar {
  to {
    transform: scaleX(1);
  }
}
</style>
