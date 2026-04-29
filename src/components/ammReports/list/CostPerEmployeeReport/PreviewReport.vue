<template>
  <v-container class="py-8 px-4" max-width="1000px">
    
    <!-- CABEÇALHO MINIMALISTA -->
    <div class="header-container mb-8">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h1 class="text-h5 font-weight-bold text-grey-darken-3">{{ $t('t-preview-report') }}</h1>
          <div class="text-caption text-grey mt-1">
            {{ $t("t-report") }} #100002 • 
            {{ $t("t-cost-per-employee") }}
          </div>
        </div>
        
        <div class="d-flex align-center">
          <v-chip variant="outlined" size="small" class="mr-3">
            <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
            {{ currentDate }}
          </v-chip>
          
          <v-btn-group variant="outlined" density="comfortable">
            <v-btn 
              color="primary" 
              prepend-icon="mdi-printer" 
              @click="handlePrint"
              :disabled="exporting"
            >
              {{ $t('t-print') }}
            </v-btn>
            
            <v-menu v-model="exportMenu" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-btn 
                  color="grey-darken-2" 
                  prepend-icon="mdi-download"
                  v-bind="props"
                  :disabled="exporting"
                  :loading="exporting"
                >
                  {{ $t('t-export') }}
                  <v-icon end>mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              
              <v-list density="compact" class="export-menu-list">
                <v-list-item
                  v-for="(option, index) in exportOptions"
                  :key="index"
                  @click="option.action(); exportMenu = false"
                >
                  <template v-slot:prepend>
                    <v-icon :color="option.color" size="18">{{ option.icon }}</v-icon>
                  </template>
                  <v-list-item-title class="export-menu-title">{{ option.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn-group>
        </div>
      </div>
      
      <v-divider thickness="2" class="mb-6"></v-divider>
    </div>

    <!-- RESUMO EM CARDS -->
    <v-row class="mb-8">
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-3">
            <div class="icon-container bg-blue-lighten-5 mr-3">
              <v-icon color="blue-darken-2">mdi-domain</v-icon>
            </div>
            <div>
              <div class="text-caption text-grey">{{ $t('t-institution') }}</div>
              <div class="text-body-1 font-weight-medium">{{ organization?.name }}</div>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="text-caption text-grey">
            <div class="d-flex align-center my-1">
              <v-icon size="small" class="mr-2">mdi-email</v-icon>
              {{ organization?.email }}
            </div>
            <div class="d-flex align-center my-1">
              <v-icon size="small" class="mr-2">mdi-phone</v-icon>
              {{ organization?.phone }}
            </div>
            <div class="d-flex align-center my-1">
              <v-icon size="small" class="mr-2">mdi-map-marker</v-icon>
              {{ organization?.address }}
            </div>
          </div>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-3">
            <div class="icon-container bg-green-lighten-5 mr-3">
              <v-icon color="green-darken-2">mdi-calendar-range</v-icon>
            </div>
            <div>
              <div class="text-caption text-grey">
                {{ hasCoveragePeriod ? $t('t-coverage-period') : $t('t-issue-period') }}
              </div>
              <div class="text-body-1 font-weight-medium">
                <template v-if="hasCoveragePeriod">
                  {{ coverage?.name }}
                </template>
                <template v-else>
                  {{ $t('t-custom-period') }}
                </template>
              </div>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="text-caption text-grey">
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t('t-start-period') }}:</span>
              <span class="font-weight-medium">
                {{ hasCoveragePeriod ? formateDate(coverage?.startDate) : formateDate(report.fromDate) }}
              </span>
            </div>
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t('t-end-period') }}:</span>
              <span class="font-weight-medium">
                {{ hasCoveragePeriod ? formateDate(coverage?.endDate) : formateDate(report.toDate) }}
              </span>
            </div>
          </div>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-3">
            <div class="icon-container bg-cyan-lighten-5 mr-3">
              <v-icon color="cyan-darken-2">mdi-account-group</v-icon>
            </div>
            <div>
              <div class="text-caption text-grey">{{ $t('t-statistics') }}</div>
              <div class="text-body-1 font-weight-medium">
                {{ totals.totalEmployees }} {{ $t('t-employees') }}
              </div>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="text-caption text-grey">
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t('t-total-amount') }}:</span>
              <span class="font-weight-medium text-red-darken-2">
                {{ amountFormate(totals.totalAmount) }} MT
              </span>
            </div>
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t('t-total-invoices') }}:</span>
              <span class="font-weight-medium">{{ totals.totalInvoices }}</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- TABELA DE COLABORADORES -->
    <v-card variant="outlined" class="mb-6" elevation="0">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" color="grey-darken-2">mdi-account-cash</v-icon>
        <span class="text-body-1 font-weight-medium">{{ $t('t-expenses-by-employee') }}</span>
        <v-chip size="small" variant="outlined" class="ml-3">
          {{ employees.length }} {{ $t('t-employees') }}
        </v-chip>
      </v-card-title>
      
      <v-divider></v-divider>
      
      <div class="table-responsive">
        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-left text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">
                <div class="d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-account</v-icon>
                  {{ $t('t-employee') }}
                </div>
              </th>
              <th class="text-right text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">
                <div class="d-flex align-center justify-end">
                  <v-icon size="small" class="mr-2">mdi-file-document-multiple</v-icon>
                  {{ $t('t-invoices') }}
                </div>
              </th>
              <th class="text-right text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">
                <div class="d-flex align-center justify-end">
                  <v-icon size="small" class="mr-2">mdi-cash</v-icon>
                  {{ $t('t-total-amount') }}
                </div>
              </th>
              <th class="text-right text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">
                <div class="d-flex align-center justify-end">
                  <v-icon size="small" class="mr-2">mdi-chart-line</v-icon>
                  {{ $t('t-average-per-invoice') }}
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody>
            <tr v-for="(employee, i) in employees" :key="i" class="table-row">
              <td class="pa-4">
                <div class="employee-name">{{ employee.employeeName }}</div>
              </td>
              <td class="text-right pa-4">
                <div class="invoices-count font-weight-medium">
                  {{ employee.totalInvoices }}
                </div>
              </td>
              <td class="text-right pa-4">
                <div class="amount-spent text-red-darken-2 font-weight-medium">
                  {{ amountFormate(employee.totalAmount) }} MT
                </div>
              </td>
              <td class="text-right pa-4">
                <div v-if="employee.totalInvoices > 0" class="average-amount text-blue-darken-2 font-weight-medium">
                  {{ amountFormate(employee.totalAmount / employee.totalInvoices) }} MT
                </div>
                <div v-else class="text-grey">
                  —
                </div>
              </td>
            </tr>
          </tbody>
          
          <tfoot>
            <tr class="total-row">
              <td class="pa-4 font-weight-bold text-grey-darken-3">
                <div class="d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-sum</v-icon>
                  {{ $t('t-totals') }}
                </div>
              </td>
              <td class="text-right pa-4">
                <div class="text-body-1 font-weight-medium">
                  {{ totals.totalInvoices }}
                </div>
              </td>
              <td class="text-right pa-4">
                <div class="text-body-1 font-weight-bold text-red-darken-2">
                  {{ amountFormate(totals.totalAmount) }} MT
                </div>
              </td>
              <td class="text-right pa-4">
                <div v-if="totals.totalInvoices > 0" class="text-body-1 font-weight-bold text-blue-darken-2">
                  {{ amountFormate(totals.averagePerInvoice) }} MT
                </div>
                <div v-else class="text-grey">
                  —
                </div>
              </td>
            </tr>
          </tfoot>
        </v-table>
      </div>
    </v-card>

    <!-- RESUMO FINANCEIRO -->
    <v-row class="mb-8">
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="pa-4" elevation="0">
          <v-card-title class="d-flex align-center pa-0 mb-3">
            <v-icon class="mr-2" color="green-darken-2">mdi-finance</v-icon>
            <span class="text-subtitle-1 font-weight-medium">{{ $t('t-financial-summary') }}</span>
          </v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div class="financial-summary">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-caption text-grey">{{ $t('t-total-amount') }}:</span>
              <span class="text-body-2 font-weight-bold text-red-darken-2">
                {{ amountFormate(totals.totalAmount) }} MT
              </span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-caption text-grey">{{ $t('t-average-per-employee') }}:</span>
              <span class="text-body-2 font-weight-bold text-cyan-darken-2">
                {{ amountFormate(totals.averagePerEmployee) }} MT
              </span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-caption text-grey">{{ $t('t-average-per-invoice') }}:</span>
              <span class="text-body-2 font-weight-bold text-green-darken-2">
                {{ amountFormate(totals.averagePerInvoice) }} MT
              </span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-between">
              <span class="text-caption text-grey">{{ $t('t-total-employees') }}:</span>
              <span class="text-body-2 font-weight-medium">{{ totals.totalEmployees }}</span>
            </div>
            <div class="d-flex justify-space-between">
              <span class="text-caption text-grey">{{ $t('t-total-invoices') }}:</span>
              <span class="text-body-2 font-weight-medium">{{ totals.totalInvoices }}</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- RODAPÉ MINIMALISTA -->
    <v-card variant="outlined" class="mt-8" elevation="0">
      <v-card-text class="pa-4">
        <div class="d-flex justify-space-between align-center flex-wrap">
          <div class="text-caption text-grey">
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2">mdi-information</v-icon>
              {{ $t('t-report-generated-automatically') }}
            </div>
            <div class="mt-1">
              {{ $t('t-cpe-system-footer') }} • {{ currentDate }}
            </div>
          </div>
          
          <div class="text-right">
            <div class="text-caption text-grey">
              {{ $t('t-generated-by') }}: {{ userName }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card-actions class="d-flex justify-space-between mt-3">
      <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack()">
        {{ $t('t-back') }} <i class="ph-arrow-left ms-2" />
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { CompanyCostPerEmployeeReportType } from "@/components/ammReports/types";
import { formateDate } from "@/app/common/dateFormate";
import { amountFormate } from '@/app/common/amountFormate';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { CostPerEmployeeReportExporter } from '@/components/ammReports/list/CostPerEmployeeReport/exportUtils';
import { useI18n } from "vue-i18n";
import { institutionService } from '@/app/http/httpServiceProvider';

const props = defineProps<{
  report: CompanyCostPerEmployeeReportType
}>();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const organizationData = ref<any>(
  props.report?.organization
  ?? props.report?.contract?.organization
  ?? props.report?.contract?.companyDetails
  ?? undefined
);
const organization = computed(() => organizationData.value);
const coverage = computed(() => props.report?.coveragePeriod);
const employees = computed(() => props.report?.invoiceEmployeeSummaries || []);
const hasCoveragePeriod = computed(() => coverage.value !== null && coverage.value !== undefined);
const router = useRouter();

// Estados para controle de loading
const exporting = ref(false);
const exportType = ref<'pdf' | 'excel' | 'csv' | null>(null);

// Nome do usuário
const userName = computed(() => {
  const user = authStore.user;
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`.trim();
});

// Data atual formatada
const currentDate = computed(() => {
  const uiLocale = locale.value === 'en' ? 'en-US' : 'pt-PT';
  return new Date().toLocaleDateString(uiLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Calcular totais
const totals = computed(() => {
  const summaries = employees.value;
  const totalAmount = summaries.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalInvoices = summaries.reduce((sum, item) => sum + item.totalInvoices, 0);
  
  return {
    totalAmount,
    totalEmployees: summaries.length,
    totalInvoices,
    averagePerEmployee: summaries.length > 0 ? totalAmount / summaries.length : 0,
    averagePerInvoice: totalInvoices > 0 ? totalAmount / totalInvoices : 0
  };
});

const onBack = () => {
  router.push({ path: `/reports/list` });
};

// Funções de exportação
const handlePrint = async () => {
  await handleExport('pdf');
};

const handleExport = async (type: 'pdf' | 'excel' | 'csv') => {
  try {
    exporting.value = true;
    exportType.value = type;
    
    const fileNamePrefix = locale.value === 'en'
      ? 'cost-per-employee-report'
      : 'relatorio-custo-por-colaborador';
    const organizationName = organization.value?.name || (locale.value === 'en' ? 'organization' : 'organizacao');
    const fileName = `${fileNamePrefix}-${organizationName}-${new Date().toISOString().split('T')[0]}`;
    
    switch (type) {
      case 'pdf':
        await CostPerEmployeeReportExporter.exportToPDF(props.report, userName.value, { fileName });
        break;
        
      case 'excel':
        await CostPerEmployeeReportExporter.exportToExcel(props.report, userName.value, { fileName });
        break;
        
      case 'csv':
        await CostPerEmployeeReportExporter.exportToCSV(props.report, userName.value, { fileName });
        break;
    }
    
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    alert(t('t-error-exporting-report'));
  } finally {
    exporting.value = false;
    exportType.value = null;
  }
};

// Menu de exportação
const exportMenu = ref(false);
const exportOptions = [
  { title: 'PDF', icon: 'mdi-file-pdf-box', color: 'red', action: () => handleExport('pdf') },
  { title: 'Excel', icon: 'mdi-file-excel', color: 'green', action: () => handleExport('excel') },
  { title: 'CSV', icon: 'mdi-file-delimited', color: 'blue', action: () => handleExport('csv') },
];

onMounted(async () => {
  if (organizationData.value || !props.report?.contractId) {
    return;
  }

  try {
    const response = await institutionService.getInstitutionById(String(props.report.contractId));
    const contract = response?.data as any;

    organizationData.value = contract?.organization
      ?? contract?.companyDetails
      ?? {
        id: contract?.organizationId ?? contract?.companyDetailsId,
        name: contract?.name,
        description: contract?.description,
        address: contract?.address,
        phone: contract?.phone,
        email: contract?.email,
        website: contract?.website,
        incomeTaxNumber: contract?.incomeTaxNumber
      };
  } catch (error) {
    console.error('Erro ao carregar organização do contrato para o preview:', error);
  }
});
</script>

<style scoped>
.header-container {
  background: linear-gradient(to right, #f8f9fa, #ffffff);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.icon-container {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-responsive {
  overflow-x: auto;
}

.table-row {
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.total-row {
  background-color: #f8f9fa;
  border-top: 2px solid #e0e0e0;
}

.employee-name {
  font-weight: 500;
  color: #37474f;
}

.invoices-count {
  font-weight: 600;
  color: #37474f;
}

.amount-spent {
  font-weight: 600;
}

.average-amount {
  font-weight: 600;
}

.financial-summary {
  padding: 8px 0;
}

/* Estilos para impressão */
@media print {
  .header-container {
    border: none;
    background: none;
    padding: 0;
  }
  
  .v-btn {
    display: none !important;
  }
  
  .table-row:hover {
    background-color: transparent;
  }
}

/* Responsividade */
@media (max-width: 960px) {
  .header-container {
    padding: 16px;
  }
  
  .d-flex.justify-space-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .d-flex.align-center:last-child {
    align-self: flex-end;
  }
}

.h-100 {
  height: 100%;
}

.text-grey-darken-3 {
  color: #37474f;
}

.bg-blue-lighten-5 {
  background-color: #e3f2fd;
}

.bg-green-lighten-5 {
  background-color: #e8f5e9;
}

.bg-cyan-lighten-5 {
  background-color: #e0f7fa;
}

.export-menu-list :deep(.v-list-item) {
  min-height: 34px;
  padding-inline: 10px;
}

.export-menu-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  font-family: inherit;
}
</style>
