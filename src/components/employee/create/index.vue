<script lang="ts" setup>
/**
 * Employee Create/Edit Component - Main Container
 * 
 * Gerencia o fluxo de criação/edição de funcionários com duas abas:
 * 1. Informações Gerais
 * 2. Instituição & Classificação
 */

import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { getApiErrorMessages, getApiValidationErrors } from "@/app/common/apiErrors";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";

// Components
import ButtonNav from "@/components/employee/create/ButtonNav.vue";
import Step1 from "@/components/employee/create/TabGeneralInfo.vue";
import Step2 from "@/components/employee/create/TabInstitution&Classification.vue";
import Step3 from "@/components/employee/create/TabDependents.vue";
import Step4 from "@/components/employee/create/TabHealthPlan.vue";
import Step5 from "@/components/employee/create/TabExpensesperProcedure.vue";

// Stores
import { useEmployeeStore } from '@/store/employee/employeeStore';
import { useProvinceStore } from '@/store/baseTables/countryStore';
import { useInstitutionStore } from '@/store/institution/institutionStore';
import { useDepartmentStore } from '@/store/institution/departmentStore';
import { usePositionStore } from '@/store/institution/positionStore';

// Services & Types
import { employeeService } from "@/app/http/httpServiceProvider";
import { EmployeeInsertType } from "../types";

// Inicialização de stores
const provinceStore = useProvinceStore();
const institutionStore = useInstitutionStore();
const departmentStore = useDepartmentStore();
const positionStore = usePositionStore();

// Props
const props = defineProps({
  cardTitle: {
    type: String,
    default: ''
  }
});

// Composables
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const employeeStore = useEmployeeStore();

// Refs
const step = ref(1);
const employeeId = ref<string | null>(
  typeof route.params.id === 'string' ? route.params.id : Array.isArray(route.params.id) ? route.params.id[0] : null
);
const routeInstitutionId = ref<string | null>(route.query.institutionId as string || null);
const loading = ref(false);
const errorMsg = ref("");
const apiFieldErrors = ref<Record<string, string[]>>({});
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const basicDataValidated = ref(false);

// Dados reativos do formulário
let employeeData = reactive<EmployeeInsertType>({
  // Dados da primeira tab
  employeeNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  maritalStatus: undefined,
  birthDate: undefined,
  bloodGroup: '',
  placeOfBirth: '',
  nationality: '',
  incomeTaxNumber: null,
  socialSecurityNumber: null,
  address: '',
  country: undefined,
  province: undefined,
  postalCode: '',
  email: '',
  phone: '',
  mobile: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  idCardNumber: null,
  idCardIssuer: '',
  idCardExpiryDate: undefined,
  idCardIssuanceDate: undefined,
  passportNumber: null,
  passportIssuer: '',
  passportIssuanceDate: undefined,
  passportExpiryDate: undefined,
  enabled: true,

  // Dados da segunda tab
  baseSalary: null,
  company: undefined,
  department: undefined,
  position: undefined,
  contractDurationType: undefined,
  hireDate: undefined,
  terminationDate: undefined,
  rehireDate: undefined
});

/**
 * Trata erros da API de forma consistente
 * @param error - Objeto de erro da API
 */
const handleApiError = (error: any) => {
  // Limpa timeout anterior se existir
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  const messages = getApiErrorMessages(error, t('t-error-saving-employee'));
  apiFieldErrors.value = getApiValidationErrors(error);
  messages.forEach((message) => toast.error(message));
  errorMsg.value = Object.keys(apiFieldErrors.value).length > 0 ? "" : messages.join("\n");

  // Configura timeout para limpar a mensagem
  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

const clearApiFieldError = (field: string) => {
  if (!apiFieldErrors.value[field]) return;
  const next = { ...apiFieldErrors.value };
  delete next[field];
  apiFieldErrors.value = next;
};

/**
 * Carrega dados do employee quando em modo de edição
 */
onMounted(async () => {
  if (employeeId.value) {
    try {
      loading.value = true;
      const response = await employeeService.getEmployeeById(employeeId.value);

      if (!response.data) {
        throw new Error("Dados do funcionário não disponíveis.");
      }

      const data = response.data;

      // Atribui os dados básicos
      Object.assign(employeeData, data);

      // Atribui IDs para relacionamentos
      employeeData.country = data.country?.id;
      employeeData.province = data.province?.id;
      employeeData.company = data.company?.id;
      console.log('Dados do funcionário carregados:', employeeData);
      employeeData.department = data.department?.id;
      employeeData.position = data.position?.id;



      // Carrega dados dependentes
      if (employeeData.company) {
        await departmentStore.fetchDepartments(employeeData.company);
      }

      if (employeeData.department) {
        await positionStore.fetchPositions(employeeData.department);
      }

    } catch (error) {
      toast.error(t('t-error-loading-employee'));
      console.error('Error loading employee:', error);
    } finally {
      loading.value = false;
    }
  }
  else {
    if (route.query.institutionId) {
      // Se estiver criando um novo funcionário, preenche o company com o institutionId da rota
      employeeData.company = Number(route.query.institutionId);
      if (employeeData.company) {
        await departmentStore.fetchDepartments(employeeData.company);
      }

      if (employeeData.department) {
        await positionStore.fetchPositions(employeeData.department);
      }
      console.log('Criando novo funcionário para instituição:', employeeData.company);
    }
  }
});

/**
 * Muda entre as abas do formulário
 * @param value - Número da aba (1 ou 2)
 */

const onStepChange = (value: number) => {
  // Permite sempre voltar para tabs anteriores
  if (value < step.value) {
    step.value = value;
    return;
  }

  // No modo de edição ou quando dados básicos já foram validados, permite navegar livremente
  if (employeeId.value || basicDataValidated.value) {
    step.value = value;
    return;
  }

  // No modo criação, só permite avançar para a próxima tab sequencialmente
  if (value === step.value + 1 && basicDataValidated.value) {
    step.value = value;
  }
};

const onBasicDataValidated = () => {
  basicDataValidated.value = true;
};

watch(
  () => employeeData,
  () => {
    if (!employeeId.value && step.value === 1) {
      basicDataValidated.value = false;
    }
  },
  { deep: true }
);


// E o watcher deve ficar assim:
watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    const tabNumber = Number(newTab);
    if (!isNaN(tabNumber)) {  // Corrigido: parêntese fechando
      onStepChange(tabNumber);
    }
  }
}, { immediate: true });


/**
 * Salva os dados do employee
 * @param isFinalStep - Indica se é o passo final (salvar e sair)
 */
const saveEmployee = async (payload: EmployeeInsertType, isFinalStep: boolean = false) => {
  try {
    loading.value = true;
    errorMsg.value = "";
    apiFieldErrors.value = {};
    console.log('EmployeeInsertType:', payload);

    // Usa os dados recebidos do payload
    Object.assign(employeeData, payload);
    const normalizedPayload = { ...payload } as EmployeeInsertType;
    normalizeObjectStringFieldsInPlace(normalizedPayload as Record<string, any>, {
      employeeNumber: "trimToEmpty",
      firstName: "trimToEmpty",
      middleName: "trimToNull",
      lastName: "trimToEmpty",
      bloodGroup: "trimToNull",
      placeOfBirth: "trimToNull",
      nationality: "trimToNull",
      incomeTaxNumber: "trimToNull",
      socialSecurityNumber: "trimToNull",
      address: "trimToNull",
      postalCode: "trimToNull",
      email: "trimToNull",
      phone: "trimToNull",
      mobile: "trimToNull",
      emergencyContactName: "trimToNull",
      emergencyContactPhone: "trimToNull",
      idCardNumber: "trimToEmpty",
      idCardIssuer: "trimToEmpty",
      passportNumber: "trimToNull",
      passportIssuer: "trimToNull",
    });

    let response;
    if (employeeId.value) {
      // Modo edição
      response = await employeeService.updateEmployee(employeeId.value, normalizedPayload);
    } else {
      // Modo criação
      response = await employeeService.createEmployee(normalizedPayload);

      if (response?.data?.id) {
        employeeId.value = response.data.id;
        employeeStore.setCurrentEmployeeId(response.data.id);
        basicDataValidated.value = true;
      } else {
        throw new Error(response?.error?.message || t('t-error-creating-employee'));
      }
    }

    // Salvar draft na store
    employeeStore.setDraftEmployee(employeeData);


    // Feedback de sucesso
    toast.success(employeeId.value
      ? t('t-employee-updated-success')
      : t('t-employee-created-success'));

    // Redirecionamento ou próxima etapa
    if (isFinalStep) {
      await employeeStore.fetchEmployees();
      router.push('/employee/list');
    } else {
      step.value++;
    }
  } catch (error) {
    console.error('Error saving employee:', error);
    handleApiError(error);
  } finally {
    loading.value = false;
  }
};

// Limpeza ao desmontar o componente
onBeforeUnmount(() => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }
});
</script>

<template>
  <Card>
    <v-card-text>
      <!-- Navegação entre abas -->
      <ButtonNav v-model="step" class="mb-2" :employee-id="employeeId as string"
        :basic-data-validated="basicDataValidated" />

      <!-- Barra de progresso para carregamento -->
      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

      <!-- Mensagens de erro -->
      <transition name="fade">
        <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-5 mt-3" variant="tonal" color="danger"
          density="compact" @click="errorMsg = ''" style="cursor: pointer; white-space: pre-line;" />
      </transition>

      <!-- Abas do formulário -->
      <Step1 v-if="step === 1" @onStepChange="onStepChange" v-model="employeeData"
        @save="(payload) => saveEmployee(payload, false)" :loading="loading" :server-errors="apiFieldErrors"
        @clear-server-error="clearApiFieldError" @validated="onBasicDataValidated" />

      <Step2 v-if="step === 2" @onStepChange="onStepChange" v-model="employeeData"
        @save="(payload) => saveEmployee(payload, true)" :loading="loading" :server-errors="apiFieldErrors"
        @clear-server-error="clearApiFieldError" />

      <Step3 v-if="step === 3" @onStepChange="onStepChange" :loading="loading" :employee-id="employeeId" />

      <Step4 v-if="step === 4" @onStepChange="onStepChange" :loading="loading" :employee-id="employeeId" />

      <Step5 v-if="step === 5" @onStepChange="onStepChange" :loading="loading" :employee-id="employeeId" />

    </v-card-text>
  </Card>
</template>

<style scoped>
/* Estilos para o date picker */
:deep(.dp__input) {
  height: 2.63rem;
}

/* Estilos para inputs de telefone */
.custom-phone-input {
  background-color: #fff;
  border: 1px solid #DDE1EF;
  border-radius: 3px;
  padding: 0;
  color: #ABABAB !important;
}

/* Ajustes para inputs com label */
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

/* Placeholder */
:deep(.m-input-input::placeholder) {
  font-size: 0.75rem !important;
}

/* Transição para mensagens de erro */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Barra de progresso para alertas */
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
