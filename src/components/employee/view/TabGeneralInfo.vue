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

import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';

// Components
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import Status from "@/app/common/components/Status.vue";
import { formateDate } from "@/app/common/dateFormate";



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
  (e: 'save'): void;
  (e: 'update:modelValue', value: EmployeeInsertType): void;
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
  showActions: {
    type: Boolean,
    default: true
  }
});

// Stores
const employeeStore = useEmployeeStore();
const countryStore = useCountryStore();
const provinceStore = useProvinceStore();

// Referências do formulário
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

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
const isDisabled = ref(true);

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
    (v: Date | string) => !!v || t('t-please-enter-birth-date'),
    (v: Date | string) => {
      if (!v) return true;
      const date = new Date(v);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 120);
      return date >= minDate || t('t-invalid-birth-date');
    }
  ],
  idCardIssuer: [
    (v: string) => !!v || t('t-please-enter-id-card-issuer'),
    (v: string) => (v && v.length <= 50) || t('t-maximum-50-characters'),
  ],
  idCardExpiryDate: [
    (v: Date | string) => !!v || t('t-please-enter-id-card-expiry-date'),
    (v: Date | string) => {
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
}



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
const submitForm = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    errorMsg.value = t('t-please-correct-errors');
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return;
  }

  emit('save');
};


const getgenderLabel = (value: string | undefined) => {
  const option = genderOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getMaritalStatusLabel = (value: string | undefined) => {
  const option = maritalStatusOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getBloodGroupLabel = (value: string | undefined) => {
  const option = bloodGroupOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};


const countryName = computed(() => {
  if (!employeeData.value.country) return '-';
  const country = countryStore.countries.find(c => c.id === employeeData.value.country);
  return country ? country.name : '-';
});

const provinceName = computed(() => {
  if (!employeeData.value.province) return '-';
  const province = provinceStore.provincesbyCountry.find(p => p.id === employeeData.value.province);
  return province ? province.name : '-';
});



</script>

<template>
  <Card :title="$t('t-general-information')" elevation="0" title-class="pb-0">
    <!-- Mensagem de erro -->
    <transition name="fade">
      <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-5 mt-3" variant="tonal" color="danger"
        density="compact" @click="errorMsg = ''" style="cursor: pointer;" />
    </transition>

    <v-card-text class="pt-0">
      <v-row class="">
        <v-col cols="12" lg="12" class="text-right">
          <Status :status="employeeData.enabled ? 'enabled' : 'disabled'" />
        </v-col>
      </v-row>
      <!-- Seção: Informações básicas -->
      <v-row class="mt-n12">
        <v-col cols="12" lg="12">
          <div class="font-weight-bold mb-2 mt-5">
            {{ $t('t-employeeNumber') }} 
          </div>
          <div>{{ employeeData.employeeNumber || '-' }}</div>
        </v-col>
      </v-row>
      <!-- Nome completo -->
      <v-row class="">
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-firstname') }} 
          </div>
          <div>{{ employeeData.firstName || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-middle-name') }}
          </div>
          <div>{{ employeeData.middleName || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-lastname') }} 
          </div>
          <div>{{ employeeData.lastName || '-' }}</div>
        </v-col>
      </v-row>

      <!-- Dados pessoais -->
      <v-row class="">
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-gender') }} 
          </div>
          <div>{{ getgenderLabel(employeeData.gender) || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-marital-status') }}
          </div>
          <div>{{ getMaritalStatusLabel(employeeData.maritalStatus) || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-blood-group') }}
          </div>
          <div>{{ getBloodGroupLabel(employeeData.bloodGroup) || '-' }}</div>
        </v-col>
      </v-row>

      <!-- Data de nascimento e local -->
      <v-row class="">
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-birth-date') }} 
          </div>
          <div>{{ formateDate(employeeData.birthDate) || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-place-of-birth') }}
          </div>
          <div>{{ employeeData.placeOfBirth || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-nacionality') }}
          </div>
          <div>{{ employeeData.nationality || '-' }}</div>
        </v-col>
      </v-row>

      <!-- Documentos -->
      <v-row class="">
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-nuit') }}
          </div>
          <div>{{ employeeData.incomeTaxNumber || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-social-security-number') }}
          </div>
          <div>{{ employeeData.socialSecurityNumber || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-address') }}
          </div>
          <div>{{ employeeData.address || '-' }}</div>
        </v-col>
      </v-row>

      <!-- País e Província -->
      <v-row class="">
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">
            {{ $t('t-country') }}
          </div>
          <div>{{ countryName || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">
            {{ $t('t-province') }}
          </div>
          <div>{{ provinceName || '-' }}</div>
        </v-col>
      </v-row>

      <!-- Código postal e contatos -->
      <v-row class="">
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-postal-code') }}
          </div>
          <div>{{ employeeData.postalCode || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-email') }}
          </div>
          <div>{{ employeeData.email || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-phone') }}
          </div>
          <div>{{ employeeData.phone || '-' }}</div>
        </v-col>
      </v-row>

      <!-- Contatos adicionais -->
      <v-row class="">
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-mobile') }}
          </div>
          <div>{{ employeeData.mobile || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-emergency-contact-name') }}
          </div>
          <div>{{ employeeData.emergencyContactName || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-emergency-contact-phone') }}
          </div>
          <div>{{ employeeData.emergencyContactPhone || '-' }}</div>
        </v-col>
      </v-row>

      <!-- Documentos de identificação -->
      <v-row class="mb-3">
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-2">
            {{ $t('t-id-card-number') }} 
          </div>
          <div>{{ employeeData.idCardNumber || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-2">
            {{ $t('t-id-card-issuer') }} 
          </div>
          <div>{{ employeeData.idCardIssuer || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-2">
            {{ $t('t-is-lifetime-id-card') }}
          </div>
          <div>{{ employeeData.isLifeTimeCard ? $t('t-yes') : $t('t-no') }}</div>
        </v-col>
        <v-col cols="12" lg="3">
          <div class="font-weight-bold mb-2">
            {{ $t('t-id-card-expiry-date') }} 
          </div>
          <div>{{ formateDate(employeeData.idCardExpiryDate) || '-' }}</div>
        </v-col>
      </v-row>

      <!-- Datas de emissão de documentos -->
      <v-row class="mb-3">
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-id-card-issuance-date') }} 
          </div>
          <div>{{ formateDate(employeeData.idCardIssuanceDate) || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-passport-number') }}
          </div>
          <div>{{ employeeData.passportNumber || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t('t-passport-issuer') }}
          </div>
          <div>{{ employeeData.passportIssuer || '-' }}</div>
        </v-col>
      </v-row>

      <!-- Datas de passaporte -->
      <v-row class="">
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">
            {{ $t('t-passport-issuance-date') }}
          </div>
          <div>{{ formateDate(employeeData.passportIssuanceDate) || '-' }}</div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">
            {{ $t('t-id-passport-expiry-date') }}
          </div>
          <div>{{ formateDate(employeeData.passportExpiryDate) || '-' }}</div>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Ações do formulário -->
    <v-card-actions v-if="showActions" class="d-flex justify-space-between mt-3">
      <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack()" :disabled="loading">
        <i class="ph-arrow-left me-2" /> {{ $t('t-back') }}
      </v-btn>

      <v-btn 
          color="secondary" 
          variant="outlined" 
          class="me-2" 
          @click="emit('onStepChange', 2)" 
          :disabled="loading"
        >
          {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
        </v-btn>

    </v-card-actions>
  </Card>
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

.dp__input_disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
