<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";

import DataTableServer from "@/app/common/components/DataTableServer.vue";
import FormTabs from "@/app/common/components/FormTabs.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { formatCurrency } from "@/app/common/currencyFormat";
import { healthPlanEmployeeService } from "@/app/http/httpServiceProvider";
import { exportHealthPlanToPdf } from "@/components/institution/create/healthPlanPdfExporter";
import { groupHealthPlanProcedures, orderHealthPlanProcedures } from "@/components/institution/create/healthPlanProcedureOrdering";
import type {
  DependentHospitalProcedurePlanUsedBalanceType,
  ExpensePerProcedureType,
  HealthPlanListingType,
  UsagesListingType
} from "@/components/employee/types";
import { usagesHeader } from "@/components/employee/create/utils";

const props = defineProps({
  backRouteBase: {
    type: String,
    default: "/employee/edit"
  },
  isEmployee: {
    type: Boolean,
    default: true
  },
  dependentId: {
    type: String,
    default: undefined
  }
});

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const route = useRoute();
type DisplayValue = number | string | null | undefined;

const activeTab = ref("main-member-plan");
const healthPlanTabQuery = computed(() => {
  const value = route.query.tab;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
});
const healthPlanTabs = computed(() => {
  const tabs: Array<{ value: string; label: string }> = [{
    value: "main-member-plan",
    label: props.isEmployee ? "t-main-member-health-plan" : "t-dependent-health-plan"
  }];

  if (props.isEmployee) {
    tabs.push({ value: "global-usage", label: "t-health-plan-global-usage" });
  }

  return tabs;
});

watch(
  () => props.isEmployee,
  (isEmployee) => {
    if (!isEmployee) activeTab.value = "main-member-plan";
  },
  { immediate: true }
);

watch(
  healthPlanTabQuery,
  (tab) => {
    if (props.isEmployee && (tab === "main-member-plan" || tab === "global-usage")) {
      activeTab.value = tab;
    }
  },
  { immediate: true }
);

const procedureLimitHeaders = computed(() => [
  { title: t("t-code"), key: "hospitalProcedureType.code", sortable: true, width: "8%" },
  { title: t("t-procedures"), key: "hospitalProcedureType.name", sortable: true, width: "24%" },
  { title: t("t-fixed-amount"), key: "fixedAmount", sortable: false, width: "11%" },
  { title: t("t-percentage"), key: "percentage", sortable: false, width: "9%" },
  { title: t("t-allocated-balance"), key: "allocatedBalance", sortable: false, width: "12%" },
  { title: t("t-used-balance"), key: "usedBalance", sortable: false, width: "11%" },
  { title: t("t-remaining-balance"), key: "remainingBalance", sortable: false, width: "12%" },
  { title: `${t("t-frequency-interval")}/${t("t-allowed-frequency-use")}`, key: "frequencyUsage", sortable: false, width: "13%" }
]);
const formulario = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const selectedUsages = ref<UsagesListingType[]>([]);
const procedureItemsPerPage = ref(10);
const usageItemsPerPage = ref(10);
const procedureSearchQuery = ref("");
const usageSearchQuery = ref("");
const loadingPlan = ref(false);
const loadingProcedureLimits = ref(false);
const healthPlanPdfExporting = ref(false);
const procedureTotalItems = ref(0);

const healthPlanId = computed(() => {
  const id = route.params.id;
  return typeof id === "string" ? id : Array.isArray(id) ? id[0] : null;
});

const memberFilterQuery = computed(() => {
  const propsList = ["isEmployee"];
  const values = [String(props.isEmployee)];

  if (!props.isEmployee && props.dependentId) {
    propsList.push("dependent.id");
    values.push(props.dependentId);
  }

  return {
    queryProps: propsList.join(","),
    queryValue: values.join(",")
  };
});

const healthPlanFormData = ref<HealthPlanListingType>({
  id: healthPlanId.value || undefined,
  allocatedBalance: 0,
  usedBalance: 0,
  remainingBalance: 0,
  employeeId: undefined,
  companyHealthPlanId: "",
  companyHealthPlan: undefined,
  employee: undefined,
  usages: []
});

const procedureLimits = ref<ExpensePerProcedureType[]>([]);
const allMainMemberProcedureLimits = ref<ExpensePerProcedureType[]>([]);
const dependentPlanSummary = ref<DependentHospitalProcedurePlanUsedBalanceType | null>(null);

const mainMemberName = computed(() => {
  const employee = healthPlanFormData.value.employee
    || dependentPlanSummary.value?.employeeHealthPlan?.employee
    || (procedureLimits.value[0] as any)?.employeeHealthPlan?.employee
    || (allMainMemberProcedureLimits.value[0] as any)?.employeeHealthPlan?.employee
    || {};

  const fullName = [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");

  return fullName || employee.name || "-";
});

const dependentName = computed(() => {
  const dependent = dependentPlanSummary.value?.dependent
    || (procedureLimits.value[0] as any)?.dependent
    || (allMainMemberProcedureLimits.value[0] as any)?.dependent
    || {};

  const fullName = [dependent.firstName, dependent.middleName, dependent.lastName]
    .filter(Boolean)
    .join(" ");

  return fullName || dependent.name || "-";
});

const mainMemberContextLabel = computed(() => {
  if (!props.isEmployee) {
    return dependentName.value !== "-" ? dependentName.value : t("t-dependent-health-plan");
  }

  const employee = healthPlanFormData.value.employee || {};
  const fullName = [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");

  return fullName || employee.name || t("t-main-member-health-plan");
});

const safeFileNamePart = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const getMainMemberPlanFileName = () => {
  const fallback = props.isEmployee ? "membro_principal" : "dependente";
  const memberName = safeFileNamePart(mainMemberContextLabel.value) || fallback;
  const date = new Date().toISOString().slice(0, 10);
  return `plano_saude_${memberName}_${date}.pdf`;
};

const getProcedureSearchableText = (procedure: ExpensePerProcedureType) => [
  getProcedureCode(procedure),
  getProcedureName(procedure),
  getProcedureCategoryName(procedure),
  getProcedureGroupName(procedure),
  getProcedureFixedAmount(procedure),
  getProcedurePercentage(procedure),
  getProcedureAllocatedBalance(procedure),
  getProcedureSpecificUsedBalance(procedure),
  getProcedureRemainingBalance(procedure),
  getProcedureFrequencyUsageLabel(procedure)
]
  .filter(value => value !== null && value !== undefined && value !== "")
  .join(" ")
  .toLowerCase();

const filterProcedureLimits = (procedures: ExpensePerProcedureType[], search: string) => {
  const trimmedSearch = search.trim().toLowerCase();
  if (!trimmedSearch) return procedures;

  return procedures.filter(procedure =>
    getProcedureSearchableText(procedure).includes(trimmedSearch)
  );
};

const fetchDependentPlanSummary = async () => {
  if (props.isEmployee || !healthPlanId.value || !props.dependentId) return;

  try {
    dependentPlanSummary.value = await healthPlanEmployeeService.getHospitalProcedureUsedBalanceByEmployeeHealthPlanAndDependent(
      healthPlanId.value,
      props.dependentId
    );
  } catch (error) {
    dependentPlanSummary.value = null;
    console.error("Erro ao carregar resumo do plano do dependente:", error);
  }
};

const fetchHealthPlan = async () => {
  if (!healthPlanId.value) return;

  loadingPlan.value = true;

  try {
    const healthplanResponse = await healthPlanEmployeeService.getHealthPlanbyId(healthPlanId.value);
    const healthPlan = healthplanResponse.content;

    if (!healthPlan) return;

    healthPlanFormData.value = {
      ...healthPlan,
      id: healthPlanId.value,
      allocatedBalance: healthPlan.allocatedBalance,
      usedBalance: healthPlan.usedBalance,
      remainingBalance: healthPlan.remainingBalance,
      employeeId: healthPlan.employeeId,
      usages: healthPlan.usages || []
    };

    await fetchDependentPlanSummary();
  } catch (error) {
    toast.error(t("t-message-load-error"));
    console.error("Erro ao carregar dados do plano de saude:", error);
  } finally {
    loadingPlan.value = false;
  }
};

const fetchMainMemberProcedureLimits = async ({ page, itemsPerPage, sortBy, search }: {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: "asc" | "desc" }>;
  search: string;
}) => {
  if (!healthPlanId.value) return;

  loadingProcedureLimits.value = true;

  try {
    const { content } = await healthPlanEmployeeService.getHospitalProcedureBalancebyEmployee(
      healthPlanId.value,
      0,
      1000000000,
      sortBy[0]?.key || "createdAt",
      sortBy[0]?.order || "asc",
      memberFilterQuery.value.queryValue,
      memberFilterQuery.value.queryProps
    );

    allMainMemberProcedureLimits.value = orderHealthPlanProcedures(content);

    const filteredContent = orderHealthPlanProcedures(
      filterProcedureLimits(content, search || procedureSearchQuery.value)
    );
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    procedureLimits.value = filteredContent.slice(start, end);
    procedureTotalItems.value = filteredContent.length;
  } catch (error) {
    procedureLimits.value = [];
    procedureTotalItems.value = 0;
    toast.error(t("t-message-load-error"));
    console.error("Erro ao carregar despesas por procedimento:", error);
  } finally {
    loadingProcedureLimits.value = false;
  }
};

const onExportMainMemberPlanPdf = async () => {
  if (!healthPlanId.value) return;

  healthPlanPdfExporting.value = true;

  try {
    let procedures = allMainMemberProcedureLimits.value;

    if (!procedures.length) {
      const { content } = await healthPlanEmployeeService.getHospitalProcedureBalancebyEmployee(
        healthPlanId.value,
        0,
        1000000000,
        "createdAt",
        "asc",
        memberFilterQuery.value.queryValue,
        memberFilterQuery.value.queryProps
      );
      allMainMemberProcedureLimits.value = orderHealthPlanProcedures(content);
      procedures = allMainMemberProcedureLimits.value;
    }

    if (!procedures.length) {
      toast.error(t("t-no-procedures-found"));
      return;
    }

    await exportHealthPlanToPdf({
      healthPlan: healthPlanFormData.value,
      procedures: orderHealthPlanProcedures(procedures) as any,
      contextLabel: mainMemberContextLabel.value,
      fileName: getMainMemberPlanFileName(),
      showUsageBalances: true,
      isEmployee: props.isEmployee,
      mainMemberName: mainMemberName.value,
      dependentName: props.isEmployee ? undefined : dependentName.value,
      allocatedBalance: displayAllocatedBalance.value,
      remainingBalance: displayRemainingBalance.value
    });
  } catch (error) {
    console.error("Erro ao exportar plano de saude do membro principal:", error);
    toast.error(t("t-message-save-error"));
  } finally {
    healthPlanPdfExporting.value = false;
  }
};

const toggleUsageSelection = (item: UsagesListingType) => {
  const index = selectedUsages.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedUsages.value = [...selectedUsages.value, item];
  } else {
    selectedUsages.value = selectedUsages.value.filter(selected => selected.id !== item.id);
  }
};

const firstDefined = (...values: DisplayValue[]): DisplayValue =>
  values.find(value => value !== null && value !== undefined && value !== "");

const getProcedureSource = (procedure: ExpensePerProcedureType | any) =>
  procedure.companyHealthPlanHospitalProcedures
  || procedure.contractHealthPlanHospitalProcedures
  || procedure.contractHealthPlanHospitalProcedure
  || procedure;

const getProcedureType = (procedure: ExpensePerProcedureType | any) =>
  procedure.hospitalProcedureType || {};

const getProcedureCode = (procedure: ExpensePerProcedureType | any) =>
  getProcedureType(procedure).code || "";

const getProcedureName = (procedure: ExpensePerProcedureType | any) =>
  getProcedureType(procedure).name || "-";

const getProcedureCategoryName = (procedure: ExpensePerProcedureType | any) =>
  getProcedureType(procedure).categoryName || t("t-procedures");

const getProcedureGroupName = (procedure: ExpensePerProcedureType | any) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  const group = item.hospitalProcedureGroup || source.hospitalProcedureGroup;
  if (!group) return "-";
  return typeof group === "object" ? group.name || "-" : String(group);
};

const procedureUsesGroupLimit = (procedure: ExpensePerProcedureType | any) => {
  const source = getProcedureSource(procedure);
  return Boolean(procedure.belongsToGroup ?? source.belongsToGroup);
};

const getProcedureFixedAmount = (procedure: ExpensePerProcedureType | any) => {
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupFixedAmount, procedure.groupFixedAmount)
    : firstDefined(source.fixedAmount, procedure.fixedAmount);
};

const getProcedurePercentage = (procedure: ExpensePerProcedureType | any) => {
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupPercentage, procedure.groupPercentage)
    : firstDefined(source.percentage, procedure.percentage);
};

const formatPlanMoney = (value: DisplayValue) => {
  if (value === null || value === undefined || value === "") return "-";
  return formatCurrency(value);
};

const formatPlanPercent = (value: DisplayValue) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}%`;
};

const getProcedureAllocatedBalance = (procedure: ExpensePerProcedureType) =>
  Number((procedureUsesGroupLimit(procedure) ? procedure.groupAllocatedBalance : procedure.allocatedBalance) || 0);

const getProcedureUsedBalance = (procedure: ExpensePerProcedureType) =>
  Number((procedureUsesGroupLimit(procedure) ? procedure.groupUsedBalance : procedure.usedBalance) || 0);

const getProcedureSpecificUsedBalance = (procedure: ExpensePerProcedureType | any) =>
  Number(firstDefined(procedure.totalUsedBalance, procedure.usedBalance) || 0);

const getGroupedProcedureUsedBalance = (procedures: ExpensePerProcedureType[]) => {
  const groupUsedBalances = procedures.map(procedure => Number(procedure.groupUsedBalance || 0));
  const groupUsedBalance = groupUsedBalances.find(value => value !== 0);
  if (groupUsedBalance !== undefined) return groupUsedBalance;

  return procedures.reduce((total, procedure) => total + getProcedureSpecificUsedBalance(procedure), 0);
};

const displayAllocatedBalance = computed(() =>
  !props.isEmployee && dependentPlanSummary.value
    ? dependentPlanSummary.value.allocatedBalance
    : healthPlanFormData.value.allocatedBalance
);

const displayUsedBalance = computed(() => {
  if (props.isEmployee) return healthPlanFormData.value.usedBalance;
  if (dependentPlanSummary.value) return dependentPlanSummary.value.usedBalance;
  return healthPlanFormData.value.usedBalance;
});

const displayRemainingBalance = computed(() =>
  !props.isEmployee && dependentPlanSummary.value
    ? dependentPlanSummary.value.remainingBalance
    : healthPlanFormData.value.remainingBalance
);

const getProcedureRemainingBalance = (procedure: ExpensePerProcedureType) =>
  Number((procedureUsesGroupLimit(procedure) ? procedure.groupRemainingBalance : procedure.remainingBalance) || 0);

const getProcedureFrequencyUsageLabel = (procedure: ExpensePerProcedureType | any) => {
  const source = getProcedureSource(procedure);
  const frequencyInterval = firstDefined(source.frequencyInterval, procedure.frequencyInterval);
  const allowedFrequencyUse = firstDefined(source.allowedFrequencyUse, procedure.allowedFrequencyUse);
  if (!frequencyInterval && !allowedFrequencyUse) return "-";
  return `${frequencyInterval || "-"}/${allowedFrequencyUse || "-"}`;
};

const groupUsesGroupLimit = (procedures: ExpensePerProcedureType[]) =>
  procedures.some(procedure => procedureUsesGroupLimit(procedure));

const getGroupLimitProcedure = (procedures: ExpensePerProcedureType[]) =>
  procedures.find(procedure => procedureUsesGroupLimit(procedure)) || procedures[0];

const getGroupFixedAmount = (procedures: ExpensePerProcedureType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureFixedAmount(procedure) : null;
};

const getGroupPercentage = (procedures: ExpensePerProcedureType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedurePercentage(procedure) : null;
};

const getGroupAllocatedBalance = (procedures: ExpensePerProcedureType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureAllocatedBalance(procedure) : 0;
};

const getGroupUsedBalance = (procedures: ExpensePerProcedureType[]) => {
  return getGroupedProcedureUsedBalance(procedures);
};

const getGroupRemainingBalance = (procedures: ExpensePerProcedureType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureRemainingBalance(procedure) : 0;
};

const getGroupFrequencyUsageLabel = (procedures: ExpensePerProcedureType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureFrequencyUsageLabel(procedure) : "-";
};

const groupProcedureLimits = (procedures: ExpensePerProcedureType[]) =>
  groupHealthPlanProcedures(procedures, t("t-procedures"));

const getUsageBeneficiaryLabel = (item: UsagesListingType) => {
  if (item.isEmployee === true) return t("t-employee");
  if (item.isEmployee === false) return t("t-dependent");
  return "-";
};

const getUsageInvoiceNumber = (item: UsagesListingType) =>
  item.invoice?.invoiceNumber || "-";

const getUsageInvoiceId = (item: UsagesListingType) =>
  item.invoiceId || item.invoice?.id;

const getReturnToWithActiveTab = () =>
  router.resolve({
    path: route.path,
    query: {
      ...route.query,
      tab: activeTab.value
    }
  }).fullPath;

const onViewInvoice = (item: UsagesListingType) => {
  const invoiceId = getUsageInvoiceId(item);
  if (!invoiceId) return;

  router.push({
    path: `/invoices/view/${invoiceId}`,
    query: {
      returnTo: getReturnToWithActiveTab(),
      returnTitle: "view-health-plan"
    }
  });
};

const onBack = () => {
  const employeeId = healthPlanFormData.value.employeeId;

  if (employeeId) {
    router.push({
      path: `${props.backRouteBase}/${employeeId}`,
      query: { tab: props.isEmployee ? 5 : 4 }
    });
    return;
  }

  router.push("/employee/list/");
};

onMounted(fetchHealthPlan);
</script>

<template>
  <Card title="">
    <v-form ref="formulario">
      <v-card-text>
        <v-card :loading="loadingPlan">
          <v-card-text>
            <v-row class="mb-2">
              <v-col cols="12" md="6" class="py-1">
                <div class="font-weight-bold mb-1">
                  {{ $t('t-main-member') }}
                </div>
                <div>{{ mainMemberName }}</div>
              </v-col>
              <v-col v-if="!props.isEmployee" cols="12" md="6" class="py-1">
                <div class="font-weight-bold mb-1">
                  {{ $t('t-dependent') }}
                </div>
                <div>{{ dependentName }}</div>
              </v-col>
            </v-row>

            <v-row class="mt-1">
              <v-col cols="12" lg="4" class="py-1">
                <div class="font-weight-bold mb-1">
                  {{ props.isEmployee ? $t('t-allocated-balance') : $t('t-global-allocated-balance') }}
                </div>
                <div>{{ formatCurrency(displayAllocatedBalance) }}</div>
              </v-col>
              <v-col cols="12" lg="4" class="py-1">
                <div class="font-weight-bold mb-1">
                  {{ props.isEmployee ? $t('t-global-used-balance') : $t('t-dependent-used-balance') }}
                </div>
                <div>{{ formatCurrency(displayUsedBalance) }}</div>
              </v-col>
              <v-col cols="12" lg="4" class="py-1">
                <div class="font-weight-bold mb-1">
                  {{ props.isEmployee ? $t('t-remaining-balance') : $t('t-global-remaining-balance') }}
                </div>
                <div>{{ formatCurrency(displayRemainingBalance) }}</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-form>

    <v-card-text>
      <FormTabs
        v-if="props.isEmployee"
        v-model="activeTab"
        :tabs="healthPlanTabs"
        class="employee-health-plan-tabs"
        aria-label="Navegação da consulta do plano de saúde"
      />

      <v-window v-model="activeTab">
        <v-window-item value="main-member-plan">
          <Card :title="$t('t-procedures-expenses-list')" title-class="pt-0 mt-5">
            <template #title-action>
              <v-btn
                color="primary"
                variant="tonal"
                :disabled="!healthPlanId || loadingProcedureLimits"
                :loading="healthPlanPdfExporting"
                @click="onExportMainMemberPlanPdf"
              >
                <i class="ph-file-pdf me-1" />
                {{ $t('t-export') }} {{ $t('t-health-plan') }}
              </v-btn>
            </template>
          </Card>

          <v-row class="mt-n3">
            <v-col cols="12">
              <v-card class="mt-5">
                <v-card-text>
                  <v-row class="employee-health-plan-search-row">
                    <v-col cols="12">
                      <QuerySearch
                        v-model="procedureSearchQuery"
                        :placeholder="$t('t-search-for-hospital-procedures')"
                        :disabled="loadingProcedureLimits"
                      />
                    </v-col>
                  </v-row>

                  <DataTableServer
                    :headers="procedureLimitHeaders"
                    :items="procedureLimits"
                    :items-per-page="procedureItemsPerPage"
                    :total-items="procedureTotalItems"
                    :loading="loadingProcedureLimits"
                    :search-query="procedureSearchQuery"
                    item-value="id"
                    :show-select="false"
                    @load-items="fetchMainMemberProcedureLimits"
                  >
                    <template #body="{ items }">
                      <template
                        v-if="(items as ExpensePerProcedureType[]).length === 0 && !loadingProcedureLimits"
                      >
                        <tr>
                          <td :colspan="procedureLimitHeaders.length" class="text-center py-10">
                            <v-avatar size="80" color="primary" variant="tonal">
                              <i class="ph-magnifying-glass" style="font-size: 30px" />
                            </v-avatar>
                            <div class="text-subtitle-1 font-weight-bold mt-3">
                              {{ $t('t-no-procedures-found') }}
                            </div>
                            <div class="text-caption text-medium-emphasis mt-2">
                              {{ $t('t-no-procedures-for-active-plan') }}
                            </div>
                          </td>
                        </tr>
                      </template>

                      <template v-else>
                        <template
                          v-for="group in groupProcedureLimits(items as ExpensePerProcedureType[])"
                          :key="group.group"
                        >
                          <tr class="procedure-group-row">
                            <td colspan="8">
                              <div class="d-flex align-center justify-space-between">
                                <span>
                                  <i class="ph-stack me-2" />
                                  {{ group.group }}
                                </span>
                                <v-chip color="secondary" variant="flat" size="x-small">
                                  {{ group.procedures.length }}
                                </v-chip>
                              </div>
                            </td>
                          </tr>

                          <tr v-if="groupUsesGroupLimit(group.procedures)" class="procedure-group-limit-row">
                            <td colspan="2">Limite do grupo</td>
                            <td>{{ formatPlanMoney(getGroupFixedAmount(group.procedures)) }}</td>
                            <td>{{ formatPlanPercent(getGroupPercentage(group.procedures)) }}</td>
                            <td>{{ formatPlanMoney(getGroupAllocatedBalance(group.procedures)) }}</td>
                            <td>{{ formatPlanMoney(getGroupUsedBalance(group.procedures)) }}</td>
                            <td>{{ formatPlanMoney(getGroupRemainingBalance(group.procedures)) }}</td>
                            <td>{{ getGroupFrequencyUsageLabel(group.procedures) }}</td>
                          </tr>

                          <template
                            v-for="category in group.categories"
                            :key="`${group.group}-${category.category}`"
                          >
                            <tr class="procedure-category-row">
                              <td colspan="8">
                                <div class="d-flex align-center justify-space-between">
                                  <span>
                                    <i class="ph-folder-open me-2" />
                                    {{ category.category }}
                                  </span>
                                  <span class="text-caption">
                                    {{ category.procedures.length }} {{ $t('t-procedures').toLowerCase() }}
                                  </span>
                                </div>
                              </td>
                            </tr>

                            <tr
                              v-for="item in category.procedures"
                              :key="item.id"
                              class="procedure-limit-row"
                              height="50"
                            >
                              <td class="font-weight-medium text-primary">{{ getProcedureCode(item) || '-' }}</td>
                              <td>
                                <div class="font-weight-medium">{{ getProcedureName(item) }}</div>
                              </td>
                              <template v-if="procedureUsesGroupLimit(item)">
                                <td class="text-muted">-</td>
                                <td class="text-muted">-</td>
                                <td class="text-muted">-</td>
                                <td>{{ formatPlanMoney(getProcedureSpecificUsedBalance(item)) }}</td>
                                <td class="text-muted">-</td>
                                <td class="text-muted">-</td>
                              </template>
                              <template v-else>
                                <td>{{ formatPlanMoney(getProcedureFixedAmount(item)) }}</td>
                                <td>{{ formatPlanPercent(getProcedurePercentage(item)) }}</td>
                                <td>{{ formatPlanMoney(getProcedureAllocatedBalance(item)) }}</td>
                                <td>{{ formatPlanMoney(getProcedureUsedBalance(item)) }}</td>
                                <td>{{ formatPlanMoney(getProcedureRemainingBalance(item)) }}</td>
                                <td>{{ getProcedureFrequencyUsageLabel(item) }}</td>
                              </template>
                            </tr>
                          </template>
                        </template>
                      </template>
                    </template>
                  </DataTableServer>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item v-if="props.isEmployee" value="global-usage">
          <Card :title="$t('t-usages-list')" title-class="pt-0 mt-5" />

          <v-row class="mt-n3">
            <v-col cols="12">
              <v-card class="mt-5">
                <v-card-text>
                  <DataTableServer
                    v-model="selectedUsages"
                    :headers="usagesHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
                    :items="healthPlanFormData.usages || []"
                    :items-per-page="usageItemsPerPage"
                    :total-items="healthPlanFormData.usages?.length || 0"
                    :loading="loadingPlan"
                    :search-query="usageSearchQuery"
                    item-value="id"
                    show-select
                  >
                    <template #body="{ items }">
                      <tr v-for="item in items as UsagesListingType[]" :key="item.id" height="50">
                        <td>
                          <v-checkbox
                            :model-value="selectedUsages.some(selected => selected.id === item.id)"
                            hide-details
                            density="compact"
                            @update:model-value="toggleUsageSelection(item)"
                          />
                        </td>
                        <td>{{ getUsageBeneficiaryLabel(item) }}</td>
                        <td>{{ getUsageInvoiceNumber(item) }}</td>
                        <td>{{ formatCurrency(item.billedAmount) }}</td>
                        <td>{{ formatCurrency(item.memberPaidAmount) }}</td>
                        <td>{{ formatCurrency(item.amountCovered) }}</td>
                        <td>
                          <v-btn
                            color="primary"
                            variant="tonal"
                            density="compact"
                            size="small"
                            class="text-none employee-health-plan__invoice-btn"
                            :disabled="!getUsageInvoiceId(item)"
                            @click="onViewInvoice(item)"
                          >
                            <i class="ph-eye me-1" />
                            {{ $t('t-view-invoice-action') }}
                          </v-btn>
                        </td>
                      </tr>
                    </template>

                    <template v-if="!healthPlanFormData.usages || healthPlanFormData.usages.length === 0" #body>
                      <tr>
                        <td :colspan="usagesHeader.length + 1" class="text-center py-10">
                          <v-avatar size="80" color="primary" variant="tonal">
                            <i class="ph-magnifying-glass" style="font-size: 30px" />
                          </v-avatar>
                          <div class="text-subtitle-1 font-weight-bold mt-3">
                            {{ $t('t-search-not-found-message') }}
                          </div>
                        </td>
                      </tr>
                    </template>
                  </DataTableServer>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>

      <v-card-actions class="d-flex justify-space-between mt-10">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack">
          {{ $t('t-back') }} <i class="ph-arrow-left ms-2" />
        </v-btn>
      </v-card-actions>
    </v-card-text>
  </Card>
</template>

<style scoped>
.employee-health-plan-tabs {
  margin-bottom: 20px;
}

.employee-health-plan-search-row {
  margin-bottom: 16px;
}

.procedure-group-row td {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.4;
  padding: 12px 14px;
  vertical-align: middle;
}

.procedure-group-limit-row td {
  background: rgba(var(--v-theme-primary), 0.035);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.12);
  color: rgba(var(--v-theme-on-surface), 0.84);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 9px 14px;
  vertical-align: middle;
}

.procedure-group-limit-row td:first-child {
  color: rgb(var(--v-theme-primary));
  text-transform: uppercase;
}

.procedure-category-row td {
  background: rgba(var(--v-theme-on-surface), 0.032);
  color: rgba(var(--v-theme-on-surface), 0.78);
  font-weight: 700;
  line-height: 1.4;
  padding: 11px 14px;
  vertical-align: middle;
}

.procedure-limit-row td {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
  font-size: 0.78rem;
  line-height: 1.35;
  vertical-align: top;
  white-space: normal;
  word-break: break-word;
}

.procedure-limit-row:hover td {
  background: rgba(var(--v-theme-primary), 0.045);
}

.employee-health-plan__invoice-btn {
  min-width: 150px;
  height: 32px;
  padding-inline: 14px;
}
</style>
