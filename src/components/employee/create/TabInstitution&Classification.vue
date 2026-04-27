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

import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';

// Components
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";

// Stores
import { useInstitutionStore } from '@/store/institution/institutionStore';
import { useDepartmentStore } from '@/store/institution/departmentStore';
import { usePositionStore } from '@/store/institution/positionStore';

// Types
import { InstitutionListingType } from "@/components/institution/types";
import { EmployeeInsertType } from "@/components/employee/types";

// Configuração inicial
const { t } = useI18n();
const toast = useToast();

import {
  contractDurationTypeOptions
} from "@/components/employee/create/utils";

// Stores
const institutionStore = useInstitutionStore();
const departmentStore = useDepartmentStore();
const positionStore = usePositionStore();

// Referência do formulário
const form2 = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

// Emits e Props
const emit = defineEmits<{
  (e: 'onStepChange', step: number): void;
  (e: 'save', payload: EmployeeInsertType): void;
  (e: 'update:modelValue', value: EmployeeInsertType): void;
  (e: 'clear-server-error', field: string): void;
}>();

const props = withDefaults(defineProps<{
  modelValue: EmployeeInsertType,
  loading?: boolean,
  serverErrors?: Record<string, string[]>,
  isEditMode?: boolean,
  showActions?: boolean
}>(), {
  loading: false,
  serverErrors: () => ({}),
  isEditMode: false,
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
const getServerErrors = (field: string) => props.serverErrors?.[field] || [];
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => {
  return [
    ...rules,
    (value: any) => {
      const hasFrontendError = rules.some((rule) => rule(value) !== true);
      if (hasFrontendError) return true;
      return getServerErrors(field)[0] || true;
    }
  ];
};

watch(
  () => props.serverErrors,
  async (errors) => {
    if (errors && Object.keys(errors).length > 0) {
      await nextTick();
      await form2.value?.validate();
    }
  },
  { deep: true }
);


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
  baseSalary: [
    (v: number) => !!v || t('t-please-enter-salary'),
    (v: number) => v > 0 || t('t-please-enter-a-valid-salary'),
  ],
  contractDurationType: [
    (v: string) => !!v || t('t-please-select-contract-duration-type'),
  ],
  hireDate: [
    (v: string) => !!v || t('t-please-enter-hire-date'),
    (v: string) => {

      const hireDate = new Date(v);
      const minDate = new Date('1900-01-01'); // Data mínima
      const today = new Date();

      if (isNaN(hireDate.getTime())) return t('t-invalid-date');
      if (hireDate < minDate) return t('t-date-too-old');
      if (hireDate > today) return t('t-date-cannot-be-future');

      return true;
    }
  ],
  terminationDate: [
    (v: string) => {
      if (employeeData.value.contractDurationType === 'FIXED_TERM') {
        // 1. Validar se terminationDate foi preenchido
        if (!v) return t('t-please-enter-termination-date');

        const terminationDate = new Date(v);
        if (isNaN(terminationDate.getTime())) return t('t-invalid-date');

        // 2. Validar se hireDate existe e é válido
        if (!employeeData.value.hireDate) {
          return t('t-please-enter-hire-date-first');
        }

        const hireDate = new Date(employeeData.value.hireDate);
        if (isNaN(hireDate.getTime())) return t('t-invalid-hire-date');

        // 3. Validar se terminationDate é depois de hireDate
        if (terminationDate <= hireDate) {
          return t('t-termination-date-after-hire-date');
        }

        return true;
      }

      return true;
    }
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
  emit('clear-server-error', 'company');
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
  emit('clear-server-error', 'department');
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

watch(() => employeeData.value.position, () => emit('clear-server-error', 'position'));
watch(() => employeeData.value.baseSalary, () => emit('clear-server-error', 'baseSalary'));
watch(() => employeeData.value.contractDurationType, () => emit('clear-server-error', 'contractDurationType'));
watch(() => employeeData.value.hireDate, () => emit('clear-server-error', 'hireDate'));
watch(() => employeeData.value.terminationDate, () => emit('clear-server-error', 'terminationDate'));
watch(() => employeeData.value.rehireDate, () => emit('clear-server-error', 'rehireDate'));

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
const validateForm = async () => {
  if (!form2.value) return false;

  const { valid } = await form2.value.validate();
  if (!valid) {
    toast.error(t('t-validation-error'));
    errorMsg.value = t('t-please-correct-errors');
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return false;
  }

  return true;
};

const saveData = async () => {
  const valid = await validateForm();
  if (!valid) return;

  console.log("Dados do funcionário:", employeeData.value);

  // Garante que o baseSalary seja enviado como número
  const payload = {
    ...employeeData.value
  };

  emit('save', payload);
};

defineExpose({
  saveData,
  validateForm
});
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
              {{ $t('t-institution') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="employeeData.company" :items="institutions" :loading="institutionStore.loading"
              :placeholder="t('t-select-institution')" clearable :rules="applyServerErrorsToRules('company', requiredRules.institution)"
              :error-messages="getServerErrors('company')" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-department') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="employeeData.department" :items="departments" :loading="departmentStore.loading"
              :placeholder="t('t-select-department')" :disabled="!employeeData.company"
              :rules="applyServerErrorsToRules('department', requiredRules.department)" @scroll-end="loadMoreDepartments"
              clearable :error-messages="getServerErrors('department')" />
          </v-col>
        </v-row>

        <!-- Cargo e Salário -->
        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-position') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="employeeData.position" :items="positions" :loading="positionStore.loading"
              :rules="applyServerErrorsToRules('position', requiredRules.position)" :placeholder="t('t-select-position')"
              :disabled="!employeeData.department" @scroll-end="loadMorePositions" clearable
              :error-messages="getServerErrors('position')" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-base-salary') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="employeeData.baseSalary" type="number"
              :placeholder="t('t-enter-the-employee-base-salary')"
              :rules="applyServerErrorsToRules('baseSalary', requiredRules.baseSalary)" class="mb-2"
              :disabled="!!isEditMode" />
          </v-col>
        </v-row>

        <v-row class="mt-n9">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-hire-date') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <ValidatedDatePicker ref="hireDatePicker" v-model="employeeData.hireDate"
              :placeholder="$t('t-enter-hire-date')" :rules="applyServerErrorsToRules('hireDate', requiredRules.hireDate)" :teleport="true"
              format="dd/MM/yyyy" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-contract-duration') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="employeeData.contractDurationType" :items="contractDurationTypeOptions"
              :rules="applyServerErrorsToRules('contractDurationType', requiredRules.contractDurationType)"
              :error-messages="getServerErrors('contractDurationType')" />
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-termination-date') }} <i v-if="employeeData.contractDurationType === 'FIXED_TERM'"
                class="ph-asterisk ph-xs text-danger" />
            </div>
            <ValidatedDatePicker ref="terminationDatePicker" v-model="employeeData.terminationDate"
              :placeholder="$t('t-enter-termination-date')" :teleport="true" format="dd/MM/yyyy"
              :rules="applyServerErrorsToRules('terminationDate', requiredRules.terminationDate)" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-rehire-date') }}
            </div>
            <ValidatedDatePicker ref="rehireDatePicker" v-model="employeeData.rehireDate" :teleport="true"
              :placeholder="$t('t-enter-rehire-date')" format="dd/MM/yyyy"
              :rules="applyServerErrorsToRules('rehireDate', [])" />
          </v-col>
        </v-row>

      </v-card-text>

      <!-- Ações do formulário -->
      <v-card-actions v-if="showActions" class="d-flex justify-space-between mt-5">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="emit('onStepChange', 1)" :disabled="loading">
          <i class="ph-arrow-left me-2" /> {{ $t('t-back-to-general-info') }}
        </v-btn>

        <v-btn color="secondary" variant="elevated" @click="saveData" :loading="loading">
          {{ $t('t-save') }}
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
