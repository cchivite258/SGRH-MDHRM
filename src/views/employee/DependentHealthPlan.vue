<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { formatCurrency } from "@/app/common/currencyFormat";
import { formateDate } from "@/app/common/dateFormate";
import { healthPlanEmployeeService, invoiceItemService, invoiceService } from "@/app/http/httpServiceProvider";
import type { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import type { DataTableHeaderType } from "@/app/common/types/table.types";
import type {
  DependentHospitalProcedurePlanLimitType,
  DependentHospitalProcedurePlanUsedBalanceType,
  EmployeeHospitalProcedurePlanUsageType,
  HealthPlanListingType
} from "@/components/employee/types";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const employeeId = computed(() => {
  const value = route.params.employeeId;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : null;
});

const dependentId = computed(() => {
  const value = route.params.dependentId;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : null;
});
const isViewMode = computed(() => route.query.mode === "view");

const itemsPerPage = ref(10);
const searchQuery = ref("");
const loading = ref(false);
const activeHealthPlan = ref<HealthPlanListingType | null>(null);
const employeeHealthPlans = ref<HealthPlanListingType[]>([]);
const resolvedEmployeeHealthPlanId = ref<string | null>(null);
const dependentPlanSummary = ref<DependentHospitalProcedurePlanUsedBalanceType | null>(null);
const planLimits = ref<DependentHospitalProcedurePlanLimitType[]>([]);
const dependentInfo = ref<DependentHospitalProcedurePlanLimitType["dependent"] | null>(null);
const selectedLimits = ref<DependentHospitalProcedurePlanLimitType[]>([]);
const extractDialog = ref(false);
const extractLoading = ref(false);
const selectedPlanLimit = ref<DependentHospitalProcedurePlanLimitType | null>(null);
const pagination = ref({
  totalElements: 0,
  currentPage: 0,
  itemsPerPage: 10,
  totalPages: 0
});

const dependentSearchProps = "hospitalProcedureType.name";
const includes = "employeeHealthPlan,contractHealthPlanHospitalProcedures,hospitalProcedureType,hospitalProcedureGroup,employeeHospitalProcedurePlanUsages,dependent";

const headers: DataTableHeaderType[] = [
  { title: "hospital-procedure-type-name", key: "hospitalProcedureType.name", sortable: true },
  { title: "hospital-procedure-group", key: "hospitalProcedureGroup.name", sortable: true },
  { title: "allocated-balance", key: "allocatedBalance", sortable: true },
  { title: "used-balance", key: "usedBalance", sortable: true },
  { title: "remaining-balance", key: "remainingBalance", sortable: true },
  { title: "billed-amount", key: "billedAmount", sortable: false },
  { title: "covered-amount", key: "amountCovered", sortable: false },
  { title: "member-paid-amount", key: "memberPaidAmount", sortable: false },
  { title: "frequency-interval", key: "frequencyInterval", sortable: true },
  { title: "last-usage-date", key: "lastUsageDate", sortable: true },
  { title: "allowed-frequency-use", key: "allowedFrequencyUse", sortable: true },
  { title: "action", key: "action", sortable: false, align: "center" }
];

const breadcrumb = computed<BreadcrumbType[]>(() => [
  {
    title: "employee-list",
    disabled: false,
    to: "/employee/list"
  },
  {
    title: isViewMode.value ? "view-employee" : "edit-employee",
    disabled: false,
    to: employeeId.value
      ? { path: `/employee/${isViewMode.value ? "view" : "edit"}/${employeeId.value}`, query: { tab: "4" } }
      : undefined
  },
  {
    title: "dependent-health-plan",
    disabled: true
  }
]);

const dependentName = computed(() => {
  const dependent = dependentPlanSummary.value?.dependent || dependentInfo.value || planLimits.value[0]?.dependent;
  if (!dependent) return "";

  return [dependent.firstName, dependent.middleName, dependent.lastName]
    .filter(Boolean)
    .join(" ");
});

const employeeName = computed(() => {
  const employee = activeHealthPlan.value?.employee
    || dependentPlanSummary.value?.employeeHealthPlan?.employee
    || planLimits.value[0]?.employeeHealthPlan?.employee
    || employeeHealthPlans.value[0]?.employee;

  if (!employee) return "";

  return [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");
});

const hasHealthPlan = computed(() =>
  Boolean(activeHealthPlan.value?.id || resolvedEmployeeHealthPlanId.value || employeeHealthPlans.value.length)
);

const getDisplayValue = (
  item: DependentHospitalProcedurePlanLimitType,
  field: "allocated" | "used" | "remaining"
) => {
  const grouped = Boolean(item.belongsToGroup);
  const fieldMap = {
    allocated: grouped ? item.groupAllocatedBalance : item.allocatedBalance,
    used: grouped ? item.groupUsedBalance : item.usedBalance,
    remaining: grouped ? item.groupRemainingBalance : item.remainingBalance
  };

  return fieldMap[field] ?? 0;
};

const getUsageTotal = (
  item: DependentHospitalProcedurePlanLimitType,
  field: "billedAmount" | "amountCovered" | "memberPaidAmount"
) => {
  return item.employeeHospitalProcedurePlanUsages?.reduce(
    (total, usage) => total + Number(usage[field] || 0),
    0
  ) ?? 0;
};

const formatOptionalNumber = (value?: number | null) => value ?? '-';

const formatOptionalDate = (value?: string | null) => value ? formateDate(value) : '-';

const selectedPlanLimitUsages = computed(() =>
  selectedPlanLimit.value?.employeeHospitalProcedurePlanUsages || []
);

const getUsageInvoiceId = (usage: EmployeeHospitalProcedurePlanUsageType) => {
  return usage.invoiceId || usage.invoice?.id || usage.invoiceItem?.invoiceId || usage.invoiceItem?.invoice?.id;
};

const getUsageInvoiceNumber = (usage: EmployeeHospitalProcedurePlanUsageType) => {
  return usage.invoiceNumber || usage.invoice?.invoiceNumber || usage.invoiceItem?.invoice?.invoiceNumber || "-";
};

const hydrateUsageInvoice = async (usage: EmployeeHospitalProcedurePlanUsageType) => {
  const currentInvoiceNumber = getUsageInvoiceNumber(usage);
  if (currentInvoiceNumber !== "-" || !usage.invoiceItemId) return;

  try {
    const { data: invoiceItem } = await invoiceItemService.getInvoiceItemById(usage.invoiceItemId);
    const invoiceFromItem = (invoiceItem as any).invoice;
    const invoiceId = invoiceFromItem?.id || getUsageInvoiceId(usage);
    let invoice = invoiceFromItem;

    if (invoiceId && !invoice?.invoiceNumber) {
      const invoiceResponse = await invoiceService.getInvoiceById(invoiceId);
      invoice = invoiceResponse.data;
    }

    usage.invoiceId = usage.invoiceId || invoiceId;
    usage.invoice = usage.invoice || invoice;
    usage.invoiceItem = {
      ...usage.invoiceItem,
      id: invoiceItem.id,
      invoiceId,
      invoice
    };
  } catch (error) {
    console.error("Erro ao carregar factura do uso do procedimento:", error);
  }
};

const hydrateUsageInvoices = async (item: DependentHospitalProcedurePlanLimitType) => {
  const usages = item.employeeHospitalProcedurePlanUsages || [];
  if (usages.length === 0) return;

  extractLoading.value = true;

  try {
    await Promise.all(usages.map(usage => hydrateUsageInvoice(usage)));
  } finally {
    extractLoading.value = false;
  }
};

const openExtract = async (item: DependentHospitalProcedurePlanLimitType) => {
  selectedPlanLimit.value = item;
  extractDialog.value = true;
  await hydrateUsageInvoices(item);
};

const onViewInvoice = (usage: EmployeeHospitalProcedurePlanUsageType) => {
  const invoiceId = getUsageInvoiceId(usage);
  if (!invoiceId) return;

  router.push({
    path: `/invoices/view/${invoiceId}`,
    query: {
      returnTo: route.fullPath,
      returnTitle: "dependent-health-plan"
    }
  });
};

const totalAllocated = computed(() => dependentPlanSummary.value?.allocatedBalance ?? activeHealthPlan.value?.allocatedBalance ?? 0);
const totalUsed = computed(() => dependentPlanSummary.value?.usedBalance ?? activeHealthPlan.value?.usedBalance ?? 0);
const totalRemaining = computed(() => dependentPlanSummary.value?.remainingBalance ?? activeHealthPlan.value?.remainingBalance ?? 0);

const loadActivePlan = async () => {
  if (!employeeId.value) return;

  const { content } = await healthPlanEmployeeService.getHealthPlansByEmployee(
    employeeId.value,
    0,
    1000,
    "createdAt",
    "asc",
    "",
    "employee.id"
  );

  employeeHealthPlans.value = content;
  activeHealthPlan.value = content.find(plan => plan.status === "ACTIVE") || null;
};

const getHealthPlanCandidates = () => {
  const candidates = [
    resolvedEmployeeHealthPlanId.value,
    activeHealthPlan.value?.id,
    ...employeeHealthPlans.value.map(plan => plan.id)
  ].filter((id): id is string => Boolean(id));

  return [...new Set(candidates)];
};

const loadDependentPlanSummary = async (employeeHealthPlanIds = getHealthPlanCandidates()) => {
  if (!dependentId.value || employeeHealthPlanIds.length === 0) return false;

  let lastError: unknown = null;

  for (const employeeHealthPlanId of employeeHealthPlanIds) {
    try {
      console.log("Consultar saldo do plano do dependente:", {
        employeeHealthPlanId,
        dependentId: dependentId.value
      });

      const summary = await healthPlanEmployeeService.getHospitalProcedureUsedBalanceByEmployeeHealthPlanAndDependent(
        employeeHealthPlanId,
        dependentId.value
      );

      dependentPlanSummary.value = summary;
      dependentInfo.value = summary.dependent || dependentInfo.value;
      activeHealthPlan.value = summary.employeeHealthPlan || activeHealthPlan.value;
      resolvedEmployeeHealthPlanId.value = summary.employeeHealthPlan?.id || employeeHealthPlanId;

      return true;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.error("Erro ao consultar saldo do plano do dependente:", lastError);
  }

  return false;
};

const fetchDependentPlan = async ({
  page,
  itemsPerPage,
  sortBy,
  search,
  searchProps
}: {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: "asc" | "desc" }>;
  search: string;
  searchProps?: string;
}) => {
  if (!dependentId.value) return;

  const employeeHealthPlanIds = getHealthPlanCandidates();
  if (employeeHealthPlanIds.length === 0) return;

  loading.value = true;

  try {
    let responseContent: DependentHospitalProcedurePlanLimitType[] = [];
    let responseMeta: any = {};
    let matchedEmployeeHealthPlanId = employeeHealthPlanIds[0];

    for (const employeeHealthPlanId of employeeHealthPlanIds) {
      console.log("Consultar plano do dependente:", {
        employeeHealthPlanId,
        dependentId: dependentId.value
      });

      const { content, meta } = await healthPlanEmployeeService.getHospitalProcedureBalanceByEmployeeHealthPlanAndDependent(
        employeeHealthPlanId,
        dependentId.value,
        page - 1,
        itemsPerPage,
        sortBy[0]?.key || "createdAt",
        sortBy[0]?.order || "asc",
        search,
        searchProps || dependentSearchProps,
        includes
      );

      responseContent = content;
      responseMeta = meta;
      matchedEmployeeHealthPlanId = employeeHealthPlanId;

      if (resolvedEmployeeHealthPlanId.value || content.length > 0) {
        break;
      }
    }

    planLimits.value = responseContent;
    dependentInfo.value = responseContent[0]?.dependent || dependentInfo.value;
    activeHealthPlan.value = responseContent[0]?.employeeHealthPlan || activeHealthPlan.value;
    resolvedEmployeeHealthPlanId.value = responseContent.length > 0
      ? matchedEmployeeHealthPlanId
      : resolvedEmployeeHealthPlanId.value;
    pagination.value = {
      totalElements: responseMeta.totalElements || responseContent.length,
      currentPage: responseMeta.page || page - 1,
      itemsPerPage: responseMeta.size || itemsPerPage,
      totalPages: responseMeta.totalPages || Math.ceil((responseMeta.totalElements || responseContent.length) / itemsPerPage)
    };
  } catch (error) {
    toast.error(t("t-message-load-error"));
    planLimits.value = [];
    pagination.value.totalElements = 0;
    console.error("Erro ao consultar plano do dependente:", error);
  } finally {
    loading.value = false;
  }
};

const toggleSelection = (item: DependentHospitalProcedurePlanLimitType) => {
  const index = selectedLimits.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedLimits.value = [...selectedLimits.value, item];
  } else {
    selectedLimits.value = selectedLimits.value.filter(selected => selected.id !== item.id);
  }
};

const onBack = () => {
  if (employeeId.value) {
    router.push({
      path: `/employee/${isViewMode.value ? "view" : "edit"}/${employeeId.value}`,
      query: { tab: "4" }
    });
    return;
  }

  router.push("/employee/list");
};

onMounted(async () => {
  if (!employeeId.value || !dependentId.value) {
    toast.error(t("t-message-load-error"));
    return;
  }

  loading.value = true;

  try {
    await loadActivePlan();

    if (getHealthPlanCandidates().length > 0) {
      await loadDependentPlanSummary();

      await fetchDependentPlan({
        page: 1,
        itemsPerPage: itemsPerPage.value,
        sortBy: [],
        search: searchQuery.value
      });
    }
  } catch (error) {
    toast.error(t("t-message-load-error"));
    console.error("Erro ao carregar plano ativo do colaborador:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <Breadcrumb title="dependent-health-plan" :items="breadcrumb" />

  <Card title="" title-class="py-5">
    <template #title-badge>
      <div class="dependent-health-plan__title">
        <h4 class="text-body-1 font-weight-bold mb-1">
          {{ $t('t-dependent-health-plan') }}
        </h4>
        <div class="dependent-health-plan__employee-name" v-if="employeeName">
          <span class="text-muted">{{ $t('t-employee') }}:</span>
          <span class="font-weight-bold ms-1">{{ employeeName }}</span>
        </div>
      </div>
    </template>
    <template #title-action>
      <v-btn color="secondary" variant="outlined" @click="onBack">
        <i class="ph-arrow-left me-2" />
        {{ $t('t-back') }}
      </v-btn>
    </template>
  </Card>

  <v-alert v-if="!hasHealthPlan && !loading" type="info" variant="tonal" class="mt-4">
    {{ $t('t-no-active-health-plan') }}
  </v-alert>

  <v-row v-if="hasHealthPlan" class="mt-3">
    <v-col cols="12" lg="12">
      <v-card class="mb-4">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6" lg="3">
              <div class="font-weight-bold mb-1">{{ $t('t-dependent') }}</div>
              <div>{{ dependentName || '-' }}</div>
            </v-col>
            <v-col cols="12" md="6" lg="3">
              <div class="font-weight-bold mb-1">Saldo Alocado ao Membro Principal</div>
              <div>{{ formatCurrency(totalAllocated) }}</div>
            </v-col>
            <v-col cols="12" md="6" lg="3">
              <div class="font-weight-bold mb-1">Valor gasto pelo Dependente</div>
              <div>{{ formatCurrency(totalUsed) }}</div>
            </v-col>
            <v-col cols="12" md="6" lg="3">
              <div class="font-weight-bold mb-1">Saldo Remanescente do Membro Principal</div>
              <div>{{ formatCurrency(totalRemaining) }}</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-hospital-procedures')" />
          </v-col>
        </v-row>
      </v-card-text>

      <DataTableServer
        class="dependent-health-plan-table"
        v-model="selectedLimits"
        :headers="headers.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="planLimits"
        :items-per-page="itemsPerPage"
        :total-items="pagination.totalElements"
        :loading="loading"
        :search-query="searchQuery"
        :search-props="dependentSearchProps"
        item-value="id"
        show-select
        @load-items="fetchDependentPlan"
      >
        <template #body="{ items }">
          <tr v-for="item in items as DependentHospitalProcedurePlanLimitType[]" :key="item.id" height="50">
            <td>
              <v-checkbox
                :model-value="selectedLimits.some(selected => selected.id === item.id)"
                hide-details
                density="compact"
                @update:model-value="toggleSelection(item)"
              />
            </td>
            <td>{{ item.hospitalProcedureType?.name || 'N/A' }}</td>
            <td>{{ item.hospitalProcedureGroup?.name || '-' }}</td>
            <td>{{ formatCurrency(getDisplayValue(item, 'allocated')) }}</td>
            <td>{{ formatCurrency(getDisplayValue(item, 'used')) }}</td>
            <td>{{ formatCurrency(getDisplayValue(item, 'remaining')) }}</td>
            <td>{{ formatCurrency(getUsageTotal(item, 'billedAmount')) }}</td>
            <td>{{ formatCurrency(getUsageTotal(item, 'amountCovered')) }}</td>
            <td>{{ formatCurrency(getUsageTotal(item, 'memberPaidAmount')) }}</td>
            <td>{{ formatOptionalNumber(item.frequencyInterval) }}</td>
            <td>{{ formatOptionalDate(item.lastUsageDate) }}</td>
            <td>{{ formatOptionalNumber(item.allowedFrequencyUse) }}</td>
            <td class="text-center">
              <v-btn
                color="primary"
                variant="tonal"
                density="compact"
                size="small"
                class="text-none dependent-health-plan__extract-btn"
                @click="openExtract(item)"
              >
                <i class="ph-eye me-1" />
                {{ $t('t-view-extract') }}
              </v-btn>
            </td>
          </tr>
        </template>

        <template v-if="planLimits.length === 0 && !loading" #body>
          <tr>
            <td :colspan="headers.length + 1" class="text-center py-10">
              <v-avatar size="80" color="primary" variant="tonal">
                <i class="ph-magnifying-glass" style="font-size: 30px" />
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold mt-3">
                {{ $t('t-no-procedures-found') }}
              </div>
            </td>
          </tr>
        </template>
      </DataTableServer>
    </v-col>
  </v-row>

  <v-dialog v-model="extractDialog" width="900" scrollable>
    <Card :title="$t('t-usages-list')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="extractDialog = false" />
      </template>

      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <div class="font-weight-bold text-caption mb-3">
          {{ selectedPlanLimit?.hospitalProcedureType?.name || '-' }}
        </div>

        <v-progress-linear v-if="extractLoading" indeterminate color="primary" class="mb-3" />

        <v-table class="dependent-health-plan__extract-table">
          <thead>
            <tr>
              <th>{{ $t('t-invoice-number') }}</th>
              <th>{{ $t('t-billed-amount') }}</th>
              <th>{{ $t('t-covered-amount') }}</th>
              <th>{{ $t('t-member-paid-amount') }}</th>
              <th class="text-center">{{ $t('t-action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usage in selectedPlanLimitUsages" :key="usage.id">
              <td>{{ getUsageInvoiceNumber(usage) }}</td>
              <td>{{ formatCurrency(usage.billedAmount) }}</td>
              <td>{{ formatCurrency(usage.amountCovered) }}</td>
              <td>{{ formatCurrency(usage.memberPaidAmount) }}</td>
              <td class="text-center">
                <v-btn
                  color="primary"
                  variant="tonal"
                  density="compact"
                  size="small"
                  class="text-none dependent-health-plan__invoice-btn"
                  :loading="extractLoading"
                  :disabled="!getUsageInvoiceId(usage)"
                  @click="onViewInvoice(usage)"
                >
                  <i class="ph-eye me-1" />
                  {{ $t('t-view-invoice') }}
                </v-btn>
              </td>
            </tr>

            <tr v-if="selectedPlanLimitUsages.length === 0">
              <td colspan="5" class="text-center py-8">
                {{ $t('t-search-not-found-message') }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-divider />

      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" class="me-1" @click="extractDialog = false">
          <i class="ph-x me-1" /> {{ $t('t-close') }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>

<style scoped>
.dependent-health-plan-table :deep(thead tr),
.dependent-health-plan-table :deep(thead th),
.dependent-health-plan-table :deep(.v-data-table__th) {
  background-color: #eef0f7 !important;
}

.dependent-health-plan-table :deep(thead th),
.dependent-health-plan-table :deep(thead th span),
.dependent-health-plan-table :deep(.v-data-table-header__content) {
  color: #111827 !important;
  font-weight: 700 !important;
}

.dependent-health-plan__extract-table :deep(thead tr),
.dependent-health-plan__extract-table :deep(thead th) {
  background-color: #eef0f7 !important;
}

.dependent-health-plan__extract-table :deep(thead th) {
  color: #111827 !important;
  font-weight: 700 !important;
}

.dependent-health-plan__extract-btn {
  min-width: 128px;
  height: 32px;
  padding-inline: 14px;
}

.dependent-health-plan__invoice-btn {
  min-width: 150px;
  height: 32px;
  padding-inline: 14px;
}

.dependent-health-plan__title {
  line-height: 1.3;
}

.dependent-health-plan__employee-name {
  font-size: 0.875rem;
  white-space: nowrap;
}
</style>
