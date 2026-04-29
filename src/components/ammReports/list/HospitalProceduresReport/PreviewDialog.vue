<script lang="ts" setup>
import { PropType, computed, ref, watch, onMounted } from "vue";
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

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const reportStore = useHospitalProceduresReportStore();


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
const contractId = ref("");
const filterType = ref("");  // NEW FIELD (1 = período, 2 = datas)
const issueDateFrom = ref(new Date());
const issueDateTo = ref(new Date());
const coveragePeriodId = ref("");

// Loading and errors
const localLoading = ref(false);
const errorMsg = ref("");

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

const selectedContract = computed(() => {
  return (institutionStore.enabledInstitutions || []).find((item: any) => String(item.id) === String(contractId.value));
});

const selectedOrganization = computed(() => {
  const contract = selectedContract.value as any;
  if (!contract) return undefined;

  return contract.organization ?? contract.companyDetails ?? {
    id: contract.organizationId ?? contract.companyDetailsId,
    name: contract.name,
    description: contract.description,
    address: contract.address,
    phone: contract.phone,
    email: contract.email,
    website: contract.website,
    incomeTaxNumber: contract.incomeTaxNumber
  };
});

// Show dialog from parent
const emit = defineEmits(["update:modelValue"]);


/* -------------------------
    VALIDATION RULES
-------------------------- */

const requiredRules = {
  contractId: [(v: string) => !!v || t('t-please-enter-institution')],
  filterType: [(v: string) => !!v || t('t-please-select-filter')],
  coveragePeriodId: [(v: string) => !!v || t('t-please-enter-coverage-period')],
  issueDateFrom: [(v: Date) => !!v || t('t-please-enter-start-date')],
  issueDateTo: [(v: Date) => !!v || t('t-please-enter-end-date')],
};

/* -------------------------
   WATCHERS
-------------------------- */

// Quando selecionar a instituição → carregar os períodos dessa instituição
watch(contractId, async (value) => {
  if (!value) return;
  filterType.value = "";           // limpa o filtro
  coveragePeriodId.value = "";     // limpa o período
  issueDateFrom.value = new Date();
  issueDateTo.value = new Date();

  await coveragePeriodStore.fetchCoveragePeriodsForDropdown(
    value,
    0,
    10000000
  );
});

/* -------------------------
   SUBMIT
-------------------------- */

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t('t-validation-error'));
    return;
  }

  localLoading.value = true;

  const payload: CompanyHospitalProceduresBalanceType = {
    contractId: contractId.value,
    issueDateFrom: filterType.value === "2" ? issueDateFrom.value : undefined,
    issueDateTo: filterType.value === "2" ? issueDateTo.value : undefined,
    coveragePeriodId: filterType.value === "1" ? coveragePeriodId.value : undefined,
  };

  // call API
  const response = await companyHospitalProceduresBalancesService.createReport(payload);
  localLoading.value = false;

  if (response.status === 'error') {
    toast.error(response.error?.message || t('t-error-generating-report'));
    return;
  }

  const previewReportData = {
    ...response.data,
    contractId: contractId.value,
    contract: response.data?.contract ?? selectedContract.value,
    contractName: response.data?.contractName ?? selectedContract.value?.name,
    organization: response.data?.organization ?? selectedOrganization.value
  };

  reportStore.setReport(previewReportData);

  emit("update:modelValue", false);

  router.push({ name: "ReportPreview" });

};


/* -------------------------
   ON MOUNT
-------------------------- */

onMounted(async () => {
  await institutionStore.fetchInstitutionsforListing(0, 10000000);
});
</script>


<template>
  <v-dialog :model-value="props.modelValue" width="500" persistent>

    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="$t('t-filters')" title-class="py-0">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="emit('update:modelValue', false)"
 />
        </template>

        <v-divider />

        <v-card-text>
          <v-row>
            <!-- Instituição -->
            <v-col cols="12" class="">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-institution') }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect v-model="contractId" :items="institutions" :rules="requiredRules.contractId"
                :loading="institutionStore.loading" />
            </v-col>

            <!-- FILTRAR POR -->
            <v-col cols="12" class="mt-n6" v-if="contractId">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-filter-by') }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect v-model="filterType" :items="[
                { value: '1', label: $t('t-coverage-period') },
                { value: '2', label: $t('t-dates') }
              ]" :rules="requiredRules.filterType" />
            </v-col>

            <!-- PERÍODO DE COBERTURA -->
            <v-col cols="12" class="mt-n6" v-if="filterType === '1'">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-coverage-period') }} <i class="ph-asterisk text-danger" />
              </div>

              <MenuSelect v-model="coveragePeriodId" :items="coveragePeriods" :rules="requiredRules.coveragePeriodId"
                :loading="coveragePeriodStore.loading" />
            </v-col>

            <!-- DATAS -->
            <template  v-if="filterType === '2'">
              <v-col cols="12" lg="6" class="mt-n6">
                <div class="font-weight-bold text-caption mb-1">
                  {{ $t('t-start-date') }} <i class="ph-asterisk text-danger" />
                </div>
                <ValidatedDatePicker v-model="issueDateFrom" :rules="requiredRules.issueDateFrom" :teleport="true" />
              </v-col>

              <v-col cols="12" lg="6" class="mt-n6">
                <div class="font-weight-bold text-caption mb-1">
                  {{ $t('t-end-date') }} <i class="ph-asterisk text-danger" />
                </div>
                <ValidatedDatePicker v-model="issueDateTo" :rules="requiredRules.issueDateTo" :teleport="true" />
              </v-col>
            </template>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-1" @click="emit('update:modelValue', false)">
            <i class="ph-x me-1" /> {{ $t('t-close') }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading"
              :disabled="localLoading">
              {{ localLoading ? $t('t-preparing') : $t('t-preview') }}
          </v-btn>
        </v-card-actions>

      </Card>
    </v-form>

  </v-dialog>
</template>
