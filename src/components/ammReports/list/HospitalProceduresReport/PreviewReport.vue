<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CompanyHospitalProceduresBalanceType } from "@/components/ammReports/types";
import { formateDate } from "@/app/common/dateFormate";
import { amountFormate } from '@/app/common/amountFormate';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { ReportExporter } from '@/components/ammReports/list/HospitalProceduresReport/exportUtils'; 

const props = defineProps<{
  report: CompanyHospitalProceduresBalanceType
}>();

const authStore = useAuthStore();
const company = computed(() => props.report?.company);
const coverage = computed(() => props.report?.coveragePeriod);
const procedures = computed(() => props.report?.procedureExpenses || []);
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

const onBack = () => {
  router.push({ path: `/reports/list` });
};

// Data atual formatada
const currentDate = computed(() => {
  return new Date().toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Funções de exportação
const handlePrint = async () => {
  try {
    exporting.value = true;
    
    const fileName = `relatorio-gastos-${company.value?.name || 'empresa'}-${new Date().toISOString().split('T')[0]}`;
    
    // Exporta para PDF em vez de abrir a caixa de diálogo de impressão
    await ReportExporter.exportToPDF(props.report, userName.value, {
      fileName
    });
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    // Fallback para impressão normal em caso de erro
    window.print();
  } finally {
    exporting.value = false;
  }
};

// No seu componente Vue (PreviewReport.vue), na função handleExport:
const handleExport = async (type: 'pdf' | 'excel' | 'csv') => {
  try {
    exporting.value = true;
    exportType.value = type;
    
    const fileName = `relatorio-gastos-${company.value?.name || 'empresa'}-${new Date().toISOString().split('T')[0]}`;
    
    switch (type) {
      case 'pdf':
        await ReportExporter.exportToPDF(props.report, userName.value, {
          fileName
        });
        break;
        
      case 'excel':
        await ReportExporter.exportToExcel(props.report, userName.value, {
          fileName
        });
        break;
        
      case 'csv':
        await ReportExporter.exportToCSV(props.report, userName.value, {
          fileName
        });
        break;
    }
    
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    alert('Ocorreu um erro ao exportar o relatório. Por favor, tente novamente.');
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
</script>

<template>
  <v-container class="py-8 px-4" max-width="1000px">
    
    <!-- CABEÇALHO MINIMALISTA -->
    <div class="header-container mb-8">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h1 class="text-h5 font-weight-bold text-grey-darken-3">{{ $t('t-preview-report') }}</h1>
          <div class="text-caption text-grey mt-1">
            {{ $t("t-report") }} #100001 • 
            {{ $t("t-total-spent-medical-assistance") }}
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
              
              <v-list density="compact">
                <v-list-item
                  v-for="(option, index) in exportOptions"
                  :key="index"
                  @click="option.action(); exportMenu = false"
                >
                  <template v-slot:prepend>
                    <v-icon :color="option.color">{{ option.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ option.title }}</v-list-item-title>
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
              <div class="text-body-1 font-weight-medium">{{ company?.name }}</div>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="text-caption text-grey">
            <div class="d-flex align-center my-1">
              <v-icon size="small" class="mr-2">mdi-email</v-icon>
              {{ company?.email }}
            </div>
            <div class="d-flex align-center my-1">
              <v-icon size="small" class="mr-2">mdi-phone</v-icon>
              {{ company?.phone }}
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
                {{ hasCoveragePeriod ? formateDate(coverage?.startDate) : formateDate(report.issueDateFrom) }}
              </span>
            </div>
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t('t-end-period') }}:</span>
              <span class="font-weight-medium">
                {{ hasCoveragePeriod ? formateDate(coverage?.endDate) : formateDate(report.issueDateTo) }}
              </span>
            </div>
          </div>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-3">
            <div class="icon-container bg-red-lighten-5 mr-3">
              <v-icon color="red-darken-2">mdi-cash-multiple</v-icon>
            </div>
            <div>
              <div class="text-caption text-grey">{{ $t('t-total-spent') }}</div>
              <div class="text-h6 font-weight-bold text-red-darken-2">
                {{ amountFormate(report.totalAmount) }} MT
              </div>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="text-caption text-grey">
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t('t-procedures') }}:</span>
              <span class="font-weight-medium">{{ procedures.length }}</span>
            </div>
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t('t-generated-by') }}:</span>
              <span class="font-weight-medium">{{ userName }}</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- TABELA MODERNA -->
    <v-card variant="outlined" class="mb-6" elevation="0">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" color="grey-darken-2">mdi-format-list-bulleted</v-icon>
        <span class="text-body-1 font-weight-medium">{{ $t('t-expenses-by-procedure') }}</span>
        <v-chip size="small" variant="outlined" class="ml-3">
          {{ procedures.length }} {{ $t('t-procedures') }}
        </v-chip>
      </v-card-title>
      
      <v-divider></v-divider>
      
      <div class="table-responsive">
        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-left text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">
                <div class="d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-pill</v-icon>
                  {{ $t('t-procedure') }}
                </div>
              </th>
              <th class="text-right text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">
                <div class="d-flex align-center justify-end">
                  <v-icon size="small" class="mr-2">mdi-cash</v-icon>
                  {{ $t('t-amount-spent') }}
                </div>
              </th>
              <th class="text-right text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">
                <div class="d-flex align-center justify-end">
                  <v-icon size="small" class="mr-2">mdi-shield-check</v-icon>
                  {{ $t('t-amount-covered') }}
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody>
            <tr v-for="(p, i) in procedures" :key="i" class="table-row">
              <td class="pa-4">
                <div class="procedure-name">{{ p.procedure.name }}</div>
              </td>
              <td class="text-right pa-4">
                <div class="amount-spent text-red-darken-2 font-weight-medium">
                  {{ amountFormate(p.amountSpent) }} MT
                </div>
              </td>
              <td class="text-right pa-4">
                <div v-if="p.amountCovered" class="amount-covered text-green-darken-2 font-weight-medium">
                  {{ amountFormate(p.amountCovered) }} MT
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
                <div class="text-body-1 font-weight-bold text-red-darken-2">
                  {{ amountFormate(report.totalAmount) }} MT
                </div>
              </td>
              <td class="text-right pa-4 text-grey">
                —
              </td>
            </tr>
          </tfoot>
        </v-table>
      </div>
    </v-card>

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
              SGRH - Sistema de Gestão de Recursos Humanos • {{ currentDate }}
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
        <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack()" >
          {{ $t('t-back') }} <i class="ph-arrow-left ms-2" />
        </v-btn>
      </v-card-actions>
  </v-container>
</template>

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

.procedure-name {
  font-weight: 500;
  color: #37474f;
}

.amount-spent {
  font-weight: 600;
}

.amount-covered {
  font-weight: 600;
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

.bg-red-lighten-5 {
  background-color: #ffebee;
}
</style>