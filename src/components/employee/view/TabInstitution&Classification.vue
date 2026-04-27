<script lang="ts" setup>
/**
 * TabInstitutionClassification - Componente para informações institucionais
 * 
 * Contém:
 * - Instituição
 * - Departamento
 * - Cargo
 * - Salário
 */

import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';

// Components
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

// Stores
import { useInstitutionStore } from '@/store/institution/institutionStore';
import { useDepartmentStore } from '@/store/institution/departmentStore';
import { usePositionStore } from '@/store/institution/positionStore';

// Types
import { InstitutionListingType } from "@/components/institution/types";
import { EmployeeInsertType } from "@/components/employee/types";
import { formateDate } from "@/app/common/dateFormate";

// Configuração inicial
const { t } = useI18n();
const toast = useToast();

// Stores
const institutionStore = useInstitutionStore();
const departmentStore = useDepartmentStore();
const positionStore = usePositionStore();

//Utils
import {
  contractDurationTypeOptions
} from "@/components/employee/create/utils";

// Referência do formulário
const form2 = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

// Emits e Props
const emit = defineEmits<{
  (e: 'onStepChange', step: number): void;
  (e: 'save'): void;
  (e: 'update:modelValue', value: EmployeeInsertType): void;
}>();

const props = withDefaults(defineProps<{
  modelValue: EmployeeInsertType,
  loading?: boolean,
  showActions?: boolean
}>(), {
  loading: false,
  showActions: true
});

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

/**
 * Regras de validação para os campos do formulário
 */
const requiredRules = {
  institution: [
    (v: string) => !!v || t('t-please-select-institution'),
  ],
  department: [
    (v: string) => !!v || t('t-please-select-department'),
  ],
  position: [
    (v: string) => !!v || t('t-please-select-position'),
  ],
  salary: [
    (v: number) => !!v || t('t-please-enter-salary'),
    (v: number) => v > 0 || t('t-please-enter-a-valid-salary'),
  ],
}

/**
 * Opções para selects (instituições, departamentos e cargos)
 */
const institutions = computed(() => {
  return institutionStore.institutions.map((institution: InstitutionListingType) => ({
    value: institution.id,
    label: institution.name
  }));
});

const departments = computed(() => {
  return departmentStore.departments.map(department => ({
    value: department.id,
    label: department.name
  }));
});

const positions = computed(() => {
  return positionStore.positions.map(position => ({
    value: position.id,
    label: position.name
  }));
});


/**
 * Carrega dados iniciais quando o componente é montado
 */
onMounted(async () => {
  try {
    await institutionStore.fetchInstitutions();
  } catch (error) {
    handleError("Falha ao carregar instituições", error);
  }
});

/**
 * Observa mudanças na instituição para carregar departamentos
 */
watch(() => employeeData.value.company, (newInstitutionId, oldInstitutionId) => {
  if (newInstitutionId) {
    departmentStore.fetchDepartments(newInstitutionId);
    if (oldInstitutionId !== undefined && oldInstitutionId !== null && oldInstitutionId !== newInstitutionId) {
      employeeData.value.department = undefined;
      employeeData.value.position = undefined;
    }
  } else {
    departmentStore.departments = [];
    positionStore.positions = [];
    employeeData.value.department = undefined;
    employeeData.value.position = undefined;
  }
});

/**
 * Observa mudanças no departamento para carregar cargos
 */
watch(() => employeeData.value.department, (newDepartmentId, oldDepartmentId) => {
  if (newDepartmentId) {
    positionStore.fetchPositions(newDepartmentId);
    if (oldDepartmentId !== undefined && oldDepartmentId !== null && oldDepartmentId !== newDepartmentId) {
      employeeData.value.position = undefined;
    }
  } else {
    positionStore.positions = [];
    employeeData.value.position = undefined;
  }
});

/**
 * Carrega mais departamentos quando chega no final do scroll
 */
const loadMoreDepartments = () => {
  if (employeeData.value.company &&
    departmentStore.pagination.currentPage < departmentStore.pagination.totalPages - 1) {
    departmentStore.fetchDepartments(
      employeeData.value.company,
      departmentStore.pagination.currentPage + 1
    );
  }
};

/**
 * Carrega mais cargos quando chega no final do scroll
 */
const loadMorePositions = () => {
  if (employeeData.value.department &&
    positionStore.pagination.currentPage < positionStore.pagination.totalPages - 1) {
    positionStore.fetchPositions(
      employeeData.value.department,
      positionStore.pagination.currentPage + 1
    );
  }
};

/**
 * Trata erros de forma consistente
 */
const handleError = (message: string, error: any) => {
  console.error(message, error);
  errorMsg.value = message;
  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

/**
 * Valida e envia o formulário
 */
const saveData = async () => {
  if (!form2.value) return;

  const { valid } = await form2.value.validate();
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

const companyName = computed(() => {
  if (!employeeData.value.company) return '-';
  const company = institutionStore.institutions.find(c => c.id === employeeData.value.company);
  return company ? company.name : '-';
});

const departmentName = computed(() => {
  if (!employeeData.value.department) return '-';
  const department = departmentStore.departments.find(d => d.id === employeeData.value.department);
  return department ? department.name : '-';
});

const positionName = computed(() => {
  if (!employeeData.value.position) return '-';
  const position = positionStore.positions.find(p => p.id === employeeData.value.position);
  return position ? position.name : '-';
});

const getContractDurationLabel = (value: string | undefined) => {
  const option = contractDurationTypeOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

</script>

<template>
  <v-form ref="form2" @submit.prevent="saveData">
    <Card :title="$t('t-institution-and-classification')" elevation="0" title-class="pb-0">
      <!-- Mensagem de erro -->
      <transition name="fade">
        <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-5 mt-3" variant="tonal" color="danger"
          density="compact" @click="errorMsg = ''" style="cursor: pointer;" />
      </transition>

      <v-card-text class="pt-0 mt-6">
        <!-- Instituição e Departamento -->
        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-institution') }}
            </div>
            <div>{{ companyName || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-department') }}
            </div>
            <div>{{ departmentName || '-' }}</div>
          </v-col>
        </v-row>

        <!-- Cargo e Salário -->
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-position') }}
            </div>
            <div>{{ positionName || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-base-salary') }}
            </div>
            <div>{{ employeeData.baseSalary || '-' }}</div>
          </v-col>
        </v-row>


        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-hire-date') }}
            </div>
            <div>{{ formateDate(employeeData.hireDate) || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-contract-duration') }}
            </div>
            <div>{{ getContractDurationLabel(employeeData.contractDurationType) || '-' }}</div>
          </v-col>
        </v-row>


        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-termination-date') }}
            </div>
            <div>{{ formateDate(employeeData.terminationDate) || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-rehire-date') }}
            </div>
            <div>{{ formateDate(employeeData.rehireDate) || '-' }}</div>
          </v-col>
        </v-row>


      </v-card-text>

      <!-- Ações do formulário -->
      <v-card-actions v-if="showActions" class="d-flex justify-space-between mt-5">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="emit('onStepChange', 1)" :disabled="loading">
          <i class="ph-arrow-left me-2" /> {{ $t('t-back-to-general-info') }}
        </v-btn>

        <v-btn color="secondary" variant="outlined" class="me-2" @click="emit('onStepChange', 3)" :disabled="loading">
          {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
        </v-btn>

      </v-card-actions>
    </Card>
  </v-form>
</template>

<style scoped>
/* Estilos consistentes com os outros componentes */
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
