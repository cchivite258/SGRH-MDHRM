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

// Stores
// import { useEmployeeStore } from '@/store/employeeStore';
import { useClinicStore } from "@/store/clinic/clinicStore"
// import { useCountryStore } from '@/store/baseTables/countryStore';
// import { useProvinceStore } from '@/store/baseTables/countryStore';

// // Types
// import { CountryListingType } from "@/components/baseTables/country/types"
// import { ProvinceListingType } from "@/components/baseTables/province/types"
import { ClinicInsertType } from "../types";

// Utils
import {
  genderOptions,
  maritalStatusOptions,
  bloodGroupOptions,
  nationalityOptions
} from "@/components/employee/create/utils";
import TextArea from "@/app/common/validationComponents/TextArea.vue";

// Configuração inicial
const { t } = useI18n();
const toast = useToast();
const router = useRouter();

// Emits e Props
const emit = defineEmits<{
  (e: 'onStepChange', step: number): void;
  (e: 'save'): void;
  (e: 'update:modelValue', value: ClinicInsertType): void;
}>();

const props = defineProps<{
  modelValue: ClinicInsertType,
  loading?: boolean
}>();

// Stores
const clinicStore = useClinicStore();

// Referências do formulário
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

// Dados computados do employee
let clinicData = computed({
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

/**
 * Regras de validação para os campos do formulário
 */
const requiredRules = {
  name: [
    (v: string) => !!v || t('t-please-enter-clinic-name'),
    (v: string) => v.length <= 100 || t('t-maximum-100-characters')
  ],
  address: [
    (v: string) => !!v || t('t-please-enter-clinic-address'),
    (v: string) => v.length <= 200 || t('t-maximum-200-characters')
  ],
  phone: [
    (v: string) => !!v || t('t-please-enter-clinic-phone'),
    (v: string) => /^\d{9}$/.test(v) || t('t-phone-must-have-9-digits')
  ],
  email: [
    (v: string) => !!v || t('t-please-enter-clinic-email'),
    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || t('t-invalid-email')
  ],
  website: [
  (v: string) => !!v || t('t-please-enter-clinic-website'),
  (v: string) => /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/.test(v) || t('t-invalid-website')
]

};



/**
 * Volta para a lista de clinics
 */
const onBack = () => {
  router.push({ path: `/clinics/list` });
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

  // emit('save'); // Se necessário para guardar os dados antes
  emit('onStepChange', 2); // Avançar para o próximo passo (step 2)
};


</script>

<template>
  <v-form ref="form" @submit.prevent="submitForm">
    <Card :title="$t('t-general-information')" elevation="0" title-class="pb-0">
      
      <!-- Mensagem de erro -->
      <transition name="fade">
        <v-alert
          v-if="errorMsg"
          :text="errorMsg"
          type="error"
          class="mb-4 mx-5 mt-3"
          variant="tonal"
          color="danger"
          density="compact"
          @click="errorMsg = ''"
          style="cursor: pointer;"
        />
      </transition>

      <v-card-text class="pt-0">
        <v-row class="">
        <v-col cols="12" lg="12" class="text-right">
          <Status :status="clinicData.enabled ? 'enabled' : 'disabled'" />
        </v-col>
      </v-row>
        <!-- Nome da Clínica -->
        <v-row class="mt-n9">
          <v-col cols="12">
            <div class="font-weight-bold mb-2 mt-5">
              {{ $t('t-clinic-name') }} 
            </div>
            <div>{{ clinicData.name || '-' }}</div>
          </v-col>
        </v-row>

        <!-- Endereço e Telefone -->
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-clinic-address') }} 
            </div>
            <div>{{ clinicData.address || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-clinic-phone') }} 
            </div>
            <div>{{ clinicData.phone || '-' }}</div>
          </v-col>
        </v-row>

        <!-- Email e Website -->
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-clinic-email') }} 
            </div>
            <div>{{ clinicData.email || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-clinic-website') }} 
            </div>
            <div>{{ clinicData.website || '-' }}</div>
          </v-col>
        </v-row>

        <!-- Descrição -->
        <v-row class="">
          <v-col cols="12">
            <div class="font-weight-bold mb-2">
              {{ $t('t-clinic-description') }}
            </div>
            <div>{{ clinicData.description || '-' }}</div>
          </v-col>
        </v-row>

      </v-card-text>

      <!-- Ações -->
      <v-card-actions class="d-flex justify-space-between mt-3">
        <v-btn
          color="secondary"
          variant="outlined"
          class="me-2"
          @click="onBack()"
          :disabled="loading"
        >
          {{ $t('t-back') }} <i class="ph-arrow-left ms-2" />
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