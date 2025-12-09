<script lang="ts" setup>
import { PropType, computed, ref, watch, onMounted, onUnmounted } from "vue";
import { CompanyHospitalProceduresBalanceType } from "@/components/ammReports/types";
import { CoveragePeriodListingType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import { useCoveragePeriodStore } from '@/store/institution/coveragePeriodStore';
import { useInstitutionStore } from '@/store/institution/institutionStore';
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { companyHospitalProceduresBalancesService } from "@/app/http/httpServiceProvider";
import { useRouter } from "vue-router";
import { useHospitalProceduresReportStore } from "@/store/reports/companyHospitalProceduresBalancesStore";
import { ReportExporter } from '@/components/ammReports/list/HospitalProceduresReport/exportUtils';
import { useAuthStore } from '@/store/authStore';

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const reportStore = useHospitalProceduresReportStore();
const authStore = useAuthStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

// Stores
const coveragePeriodStore = useCoveragePeriodStore();
const institutionStore = useInstitutionStore();

// Form fields
const companyId = ref("");
const filterType = ref("");
const issueDateFrom = ref<Date | undefined >(new Date());
const issueDateTo = ref<Date | undefined >(new Date());
const coveragePeriodId = ref("");

// Loading
const localLoading = ref(false);
const errorMsg = ref("");
let processingTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed lists
const coveragePeriods = computed(() => {
  return (coveragePeriodStore.coverage_periods_for_dropdown || [])
    .map((item: CoveragePeriodListingType) => ({
      value: item.id,
      label: item.name,
    }));
});

const institutions = computed(() => {
  return (institutionStore.enabledInstitutions || []).map(item => ({
    value: item.id,
    label: item.name,
  }));
});

// Emit
const emit = defineEmits(["update:modelValue"]);

// Nome REAL do usuário - usando dados do authStore
const userName = computed(() => {
  if (!authStore.user) return 'Sistema';
  
  const user = authStore.user;
  // Verifique a estrutura real do seu user object
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`.trim();
  }
  if (user.name) {
    return user.name;
  }
  if (user.email) {
    return user.email.split('@')[0];
  }
  return 'Usuário';
});

/* -------------------------
    VALIDATION RULES
-------------------------- */

const requiredRules = {
  companyId: [(v: string) => !!v || t('t-please-enter-institution')],
  filterType: [(v: string) => !!v || t('t-please-select-filter')],
  coveragePeriodId: [
    (v: string) => {
      if (filterType.value === '1') {
        return !!v || t('t-please-enter-coverage-period');
      }
      return true;
    }
  ],
  issueDateFrom: [
    (v: Date | null) => {
      if (filterType.value === '2') {
        return !!v || t('t-please-enter-start-date');
      }
      return true;
    }
  ],
  issueDateTo: [
    (v: Date | null) => {
      if (filterType.value === '2') {
        return !!v || t('t-please-enter-end-date');
      }
      return true;
    }
  ],
};

/* -------------------------
   WATCHERS
-------------------------- */

watch(companyId, async (value) => {
  if (!value) return;
  filterType.value = "";
  coveragePeriodId.value = "";
  issueDateFrom.value = new Date();
  issueDateTo.value = new Date();

  await coveragePeriodStore.fetchCoveragePeriodsForDropdown(value, 0, 10000000);
});

/* -------------------------
   FUNCTIONS
-------------------------- */

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

// Configurar timeout
const setupTimeout = () => {
  if (processingTimeout) {
    clearTimeout(processingTimeout);
  }
  
  processingTimeout = setTimeout(() => {
    if (localLoading.value) {
      localLoading.value = false;
      errorMsg.value = t('t-processing-timeout');
      toast.error(t('t-processing-timeout'));
      
      // Log para debug
      console.log('Timeout acionado após 5 minutos');
    }
  }, 300000); // 5 minutos
};

// Limpar timeout
const clearTimeoutFunc = () => {
  if (processingTimeout) {
    clearTimeout(processingTimeout);
    processingTimeout = null;
  }
};

// Reset form
const resetForm = () => {
  companyId.value = "";
  filterType.value = "";
  coveragePeriodId.value = "";
  issueDateFrom.value = new Date();
  issueDateTo.value = new Date();
  errorMsg.value = "";
};

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t('t-validation-error'));
    return;
  }

  // Iniciar loading e timeout
  localLoading.value = true;
  errorMsg.value = "";
  setupTimeout();

  try {
    const payload: CompanyHospitalProceduresBalanceType = {
      companyId: companyId.value,
      issueDateFrom: filterType.value === "2" && issueDateFrom.value ? issueDateFrom.value : undefined,
      issueDateTo: filterType.value === "2" && issueDateTo.value ? issueDateTo.value : undefined,
      coveragePeriodId: filterType.value === "1" ? coveragePeriodId.value : undefined,
    };

    //console.log('Gerando relatório com payload:', payload);
    //console.log('Usuário atual:', userName.value, 'Dados completos:', authStore.user);

    const response = await companyHospitalProceduresBalancesService.createReport(payload);
    
    if (response.status === 'error') {
      toast.error(response.error?.message || t('t-error-generating-report'));
      localLoading.value = false;
      clearTimeoutFunc();
      return;
    }

    if (!response.data) {
      toast.error(t('t-no-report-data'));
      localLoading.value = false;
      clearTimeoutFunc();
      return;
    }

    // Nome do arquivo
    const companyName = institutions.value.find(inst => inst.value === companyId.value)?.label || 'empresa';
    const fileName = `relatorio-gastos-${companyName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}`;
    
    //console.log('Exportando PDF para:', fileName);
    //console.log('Nome do usuário usado:', userName.value);

    // Exportar PDF
    await ReportExporter.exportToPDF(response.data, userName.value, {
      fileName
    });

    // Sucesso
    clearTimeoutFunc();
    emit("update:modelValue", false);
    resetForm();
    
    toast.success(t('t-pdf-generated-successfully'));

  } catch (error: any) {
    console.error('Erro completo:', error);
    
    clearTimeoutFunc();
    localLoading.value = false;
    
    let errorMessage = t('t-error-generating-pdf');
    
    if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
      errorMessage = t('t-processing-timeout');
    } else if (error.message?.includes('network')) {
      errorMessage = t('t-network-error');
    }
    
    toast.error(errorMessage);
    errorMsg.value = errorMessage;
  }
  finally {
    localLoading.value = false;
  }
};

/* -------------------------
   LIFECYCLE
-------------------------- */

onMounted(async () => {
  await institutionStore.fetchInstitutionsforListing(0, 10000000);
});

onUnmounted(() => {
  clearTimeoutFunc();
});
</script>

<template>
  <v-dialog :model-value="props.modelValue" width="500" persistent>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="$t('t-filters')" title-class="py-0">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="emit('update:modelValue', false)" />
        </template>

        <v-divider />

        <v-card-text>
          <!-- Mensagem de erro -->
          <v-alert 
            v-if="errorMsg" 
            :text="errorMsg" 
            type="error" 
            class="mb-4" 
            variant="tonal" 
            density="compact"
            closable
            @click:close="errorMsg = ''"
          />

          <v-row>
            <!-- Instituição -->
            <v-col cols="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-institution') }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect 
                v-model="companyId" 
                :items="institutions" 
                :rules="requiredRules.companyId"
                :loading="institutionStore.loading" 
              />
            </v-col>

            <!-- FILTRAR POR -->
            <v-col cols="12" class="mt-n6" v-if="companyId">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-filter-by') }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect 
                v-model="filterType" 
                :items="[
                  { value: '1', label: $t('t-coverage-period') },
                  { value: '2', label: $t('t-dates') }
                ]" 
                :rules="requiredRules.filterType" 
              />
            </v-col>

            <!-- PERÍODO DE COBERTURA -->
            <v-col cols="12" class="mt-n6" v-if="filterType === '1'">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-coverage-period') }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect 
                v-model="coveragePeriodId" 
                :items="coveragePeriods" 
                :rules="requiredRules.coveragePeriodId"
                :loading="coveragePeriodStore.loading" 
              />
            </v-col>

            <!-- DATAS -->
            <template v-if="filterType === '2'">
              <v-col cols="12" lg="6" class="mt-n6">
                <div class="font-weight-bold text-caption mb-1">
                  {{ $t('t-start-date') }} <i class="ph-asterisk text-danger" />
                </div>
                <ValidatedDatePicker 
                  v-model="issueDateFrom" 
                  :rules="requiredRules.issueDateFrom" 
                  :teleport="true" 
                />
              </v-col>

              <v-col cols="12" lg="6" class="mt-n6">
                <div class="font-weight-bold text-caption mb-1">
                  {{ $t('t-end-date') }} <i class="ph-asterisk text-danger" />
                </div>
                <ValidatedDatePicker 
                  v-model="issueDateTo" 
                  :rules="requiredRules.issueDateTo" 
                  :teleport="true" 
                />
              </v-col>
            </template>
          </v-row>
          
        </v-card-text>

        <v-divider />


        <v-card-actions class="d-flex justify-end">
          <v-btn 
            color="danger" 
            class="me-2" 
            @click="emit('update:modelValue', false)"
            :disabled="localLoading"
          >
            <i class="ph-x me-1" /> {{ $t('t-close') }}
          </v-btn>
          
          <v-btn 
            color="primary" 
            variant="elevated" 
            @click="onSubmit" 
            :loading="localLoading"
            :disabled="localLoading"
          >
            <template v-if="localLoading">
              <v-progress-circular indeterminate size="20" width="2" class="mr-2" />
              {{ $t('t-generating-pdf') }}
            </template>
            <template v-else>
              <i class="ph-file-pdf me-1" /> {{ $t('t-generate-pdf') }}
            </template>
          </v-btn>
        </v-card-actions>

      </Card>
    </v-form>
  </v-dialog>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>