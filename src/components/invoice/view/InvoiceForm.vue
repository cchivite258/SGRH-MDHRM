<script lang="ts" setup>
import InvoiceSVG from "@/assets/images/invoice.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import ProductCard from "@/components/invoice/view/ProductCard.vue";
import { ref, computed, onMounted, watch, reactive } from "vue";
import { InvoiceInsertType, InvoiceItemInsertType } from "@/components/invoice/types";
import { useServiceProviderStore } from "@/store/serviceProvider/serviceProviderStore";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useEmployeeStore } from "@/store/employee/employeeStore";
import { useCurrencyStore } from "@/store/baseTables/currencyStore";
import { useDependentEmployeeStore } from "@/store/employee/dependentStore";
import { useHealthPlanStore } from "@/store/institution/healthPlanStore";
import { useHospitalProcedureBalanceStore } from "@/store/employee/hospitalProcedureBalanceStore";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import { useRouter } from "vue-router";
import { useInvoiceStore } from "@/store/invoice/invoiceStore";
import { invoiceService } from "@/app/http/httpServiceProvider";
import type { HospitalProcedureListingType } from "@/components/institution/types";
import type { ExpensePerProcedureType } from "@/components/employee/types";
import { formatCurrency } from "@/app/common/currencyFormat";
import { limitTypeDefinitionOptions } from "@/components/institution/create/utils";
import { exportHealthPlanToPdf } from "@/components/institution/create/healthPlanPdfExporter";
import { groupHealthPlanProcedures, orderHealthPlanProcedures } from "@/components/institution/create/healthPlanProcedureOrdering";
import Status from "@/app/common/components/Status.vue";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";

// Composables
const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const invoiceStore = useInvoiceStore();
const { can, canAny } = usePermissions();

// Props
const props = defineProps({
  modelValue: {
    type: Object as () => InvoiceInsertType,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  initialItems: {
    type: Array as () => InvoiceItemInsertType[],
    default: () => []
  }
});

// Emits
const emit = defineEmits<{
  (e: 'save', invoiceData: InvoiceInsertType): void;
  (e: 'update:modelValue', value: InvoiceInsertType): void;
  (e: 'items-ready', items: InvoiceItemInsertType[]): void;
}>();

// Stores
const serviceProviderStore = useServiceProviderStore();
const institutionStore = useInstitutionStore();
const employeeStore = useEmployeeStore();
const currencyStore = useCurrencyStore();
const dependentStore = useDependentEmployeeStore();
const healthPlanStore = useHealthPlanStore();
const hospitalProcedureBalanceStore = useHospitalProcedureBalanceStore();

// Refs
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const productCardRef = ref<{ emitItemsReady: () => boolean }>();
const errorMsg = ref("");
const alertTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const healthPlanDialog = ref(false);
const healthPlanConsultLoading = ref(false);
const healthPlanPdfExporting = ref(false);
const healthPlanProcedureSearch = ref("");
const employeeActiveHealthPlan = ref<any>(null);
const employeePlanProcedureLimits = ref<ExpensePerProcedureType[]>([]);

// Computed
const invoiceData = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

const invoiceItemData = reactive<InvoiceItemInsertType>({
  unitPrice: 0,
  quantity: 0,
  taxRate: '',
  description: '',
  companyAllowedHospitalProcedure: '',
  invoice: invoiceStore.currentInvoiceId,
  totalAmount: 0
});

const institutions = computed(() => {
  const options = institutionStore.enabledInstitutions.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  if (
    invoiceData.value.company &&
    invoiceData.value.companyLabel &&
    !options.some(item => item.value === String(invoiceData.value.company))
  ) {
    options.push({
      value: String(invoiceData.value.company),
      label: invoiceData.value.companyLabel
    });
  }

  return options;
});

const service_providers = computed(() => {
  const options = serviceProviderStore.service_provider_list.map((service_provider) => ({
    value: service_provider.id,
    label: service_provider.name
  }));

  if (
    invoiceData.value.serviceProvider &&
    invoiceData.value.serviceProviderLabel &&
    !options.some(item => item.value === invoiceData.value.serviceProvider)
  ) {
    options.push({
      value: invoiceData.value.serviceProvider,
      label: invoiceData.value.serviceProviderLabel
    });
  }

  return options;
});

const employees = computed(() => {
  const options = employeeStore.employeesForDropdown.map((item) => ({
    value: item.id,
    label: `${item.firstName} ${item.lastName}`,
  }));

  if (
    invoiceData.value.employee &&
    invoiceData.value.employeeLabel &&
    !options.some(item => item.value === invoiceData.value.employee)
  ) {
    options.push({
      value: invoiceData.value.employee,
      label: invoiceData.value.employeeLabel
    });
  }

  return options;
});

const currencies = computed(() => {
  return currencyStore.currenciesForDropdown.map((item) => ({
    value: item.id,
    label: item.name,
  }));
});

const dependents = computed(() => {
  const options = dependentStore.dependentsForDropdown.map((item) => ({
    value: item.id,
    label: `${item.firstName} ${item.lastName}`,
  }));

  if (
    invoiceData.value.dependent &&
    invoiceData.value.dependentLabel &&
    !options.some(item => item.value === invoiceData.value.dependent)
  ) {
    options.push({
      value: invoiceData.value.dependent,
      label: invoiceData.value.dependentLabel
    });
  }

  return options;
});

const activeHealthPlan = computed(() =>
  employeeActiveHealthPlan.value?.contractHealthPlan
  || employeeActiveHealthPlan.value?.companyHealthPlan
  || healthPlanStore.activeHealthPlan
  || employeeActiveHealthPlan.value
);

// Na consulta, o ProductCard precisa do plano da factura, não necessariamente do plano activo actual.
const invoiceHealthPlanId = computed(() => {
  const invoice = invoiceData.value as any;
  const coveragePeriod = invoice.coveragePeriod || {};
  return String(firstDefined(
    coveragePeriod.companyHealthPlanId,
    coveragePeriod.contractHealthPlanId,
    coveragePeriod.companyHealthPlan?.id,
    coveragePeriod.contractHealthPlan?.id,
    invoice.companyHealthPlanId,
    invoice.contractHealthPlanId,
    invoice.companyHealthPlan?.id,
    invoice.contractHealthPlan?.id
  ) || "");
});

const activePlanProcedures = computed(() => orderHealthPlanProcedures(employeePlanProcedureLimits.value || [], t("t-procedures")));

const invoiceStatus = computed(() => String(invoiceData.value.invoiceStatus || "DRAFT").toUpperCase());
const canCreateInvoice = computed(() => can(PERMISSIONS.INVOICES.CREATE));
const canConsultHealthPlan = computed(() => canAny(PERMISSIONS.EMPLOYEE.HEALTH_PLAN_VIEW));
const invoiceActionReasonName = computed(() => {
  const data = invoiceData.value as any;
  const reason = data.reason;

  if (reason && typeof reason === "object") {
    return reason.name || reason.description || reason.id || "";
  }

  return data.reasonName || reason || data.reasonId || "";
});

type DisplayValue = number | string | null | undefined;

const firstDefined = (...values: DisplayValue[]): DisplayValue =>
  values.find(value => value !== null && value !== undefined && value !== "");

const getProcedureType = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) =>
  procedure.hospitalProcedureType || {};

const getProcedureName = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) =>
  getProcedureType(procedure).name || "-";

const getProcedureCode = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) =>
  getProcedureType(procedure).code || "";

const getProcedureCategoryName = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) =>
  getProcedureType(procedure).categoryName || t("t-procedures");

const getProcedureGroupName = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) => {
  const group = procedure.hospitalProcedureGroup;
  if (!group) return "-";
  return typeof group === "object" ? group.name || "-" : String(group);
};

const getProcedureGroupIdentity = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return String(firstDefined(
    item.hospitalProcedureGroupId,
    source.hospitalProcedureGroupId,
    item.hospitalProcedureGroup?.id,
    source.hospitalProcedureGroup?.id,
    getProcedureGroupName(procedure)
  ));
};

const getProcedureSource = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) => {
  const item = procedure as any;
  return item.companyHealthPlanHospitalProcedures
    || item.contractHealthPlanHospitalProcedures
    || item.contractHealthPlanHospitalProcedure
    || item;
};

const getProcedureIdentity = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return String(firstDefined(
    item.contractHealthPlanHospitalProceduresId,
    item.companyHealthPlanHospitalProceduresId,
    source.id,
    item.hospitalProcedureTypeId,
    getProcedureType(procedure).id,
    item.id
  ));
};

const getNumberValue = (value: number | string | null | undefined) =>
  Number(value || 0);

const mergeProcedureLimit = (existing: ExpensePerProcedureType, incoming: ExpensePerProcedureType) => {
  const current = existing as any;
  const next = incoming as any;
  const currentUsages = Array.isArray(current.employeeHospitalProcedurePlanUsages) ? current.employeeHospitalProcedurePlanUsages : [];
  const nextUsages = Array.isArray(next.employeeHospitalProcedurePlanUsages) ? next.employeeHospitalProcedurePlanUsages : [];

  return {
    ...existing,
    ...incoming,
    usedBalance: getNumberValue(existing.usedBalance) + getNumberValue(incoming.usedBalance),
    groupUsedBalance: Math.max(getNumberValue(existing.groupUsedBalance), getNumberValue(incoming.groupUsedBalance)),
    totalUsedBalance: getNumberValue(current.totalUsedBalance) + getNumberValue(next.totalUsedBalance),
    employeeHospitalProcedurePlanUsages: [...currentUsages, ...nextUsages]
  } as ExpensePerProcedureType;
};

const getInvoiceMemberProcedureLimits = (procedures: ExpensePerProcedureType[]) => {
  const uniqueProcedures = new Map<string, ExpensePerProcedureType>();

  procedures.forEach((procedure) => {
    const key = getProcedureIdentity(procedure);
    const existingProcedure = uniqueProcedures.get(key);
    if (existingProcedure) {
      uniqueProcedures.set(key, mergeProcedureLimit(existingProcedure, procedure));
    } else {
      uniqueProcedures.set(key, procedure);
    }
  });

  return Array.from(uniqueProcedures.values());
};

const procedureUsesGroupLimit = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return Boolean(item.belongsToGroup ?? source.belongsToGroup);
};

const getBalanceValue = (
  procedure: ExpensePerProcedureType,
  individualKey: keyof Pick<ExpensePerProcedureType, "allocatedBalance" | "usedBalance" | "remainingBalance">,
  groupKey: keyof Pick<ExpensePerProcedureType, "groupAllocatedBalance" | "groupUsedBalance" | "groupRemainingBalance">
) => {
  const value = procedureUsesGroupLimit(procedure)
    ? procedure[groupKey] as DisplayValue
    : procedure[individualKey] as DisplayValue;

  return Number(value || 0);
};

const planAllocatedBalance = computed(() =>
  Number(employeeActiveHealthPlan.value?.allocatedBalance ?? activePlanProcedures.value.reduce(
    (total, procedure) => total + getBalanceValue(procedure, "allocatedBalance", "groupAllocatedBalance"),
    0
  ))
);

const planUsedBalance = computed(() =>
  activePlanProcedures.value.length
    ? getPlanUsedBalanceTotal(activePlanProcedures.value)
    : Number(firstDefined(
      employeeActiveHealthPlan.value?.totalUsedBalance,
      activePlanProcedures.value[0]?.employeeHealthPlan?.totalUsedBalance,
      employeeActiveHealthPlan.value?.usedBalance
    ) || 0)
);

const planRemainingBalance = computed(() =>
  Number(employeeActiveHealthPlan.value?.remainingBalance ?? activePlanProcedures.value.reduce(
    (total, procedure) => total + getBalanceValue(procedure, "remainingBalance", "groupRemainingBalance"),
    0
  ))
);

const filteredPlanProcedures = computed(() => {
  const search = healthPlanProcedureSearch.value.trim().toLowerCase();

  if (!search) return activePlanProcedures.value;

  return activePlanProcedures.value.filter((procedure) => {
    const procedureType = procedure.hospitalProcedureType || {};
    const procedureRecord = procedure as any;
    const searchable = [
      procedureType.code,
      procedureType.name,
      procedureType.categoryName,
      getProcedureGroupName(procedure),
      procedureRecord.limitTypeDefinition,
      procedureRecord.limitType,
      procedure.allocatedBalance,
      procedure.usedBalance,
      procedureRecord.totalUsedBalance,
      procedure.remainingBalance,
      procedure.groupAllocatedBalance,
      procedure.groupUsedBalance,
      procedure.groupRemainingBalance
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(search);
  });
});

const groupedPlanProcedureGroups = computed(() => {
  return groupHealthPlanProcedures(filteredPlanProcedures.value, t("t-procedures"));
});

const activePlanCoveragePeriod = computed(() =>
  activeHealthPlan.value?.coveragePeriod?.name
  || activeHealthPlan.value?.coveragePeriodName
  || activeHealthPlan.value?.name
  || "-"
);

// Validation rules
const requiredRules = {
  institution: [(v: string) => !!v || t('t-institution-required')],
  service_provider: [(v: string) => !!v || t('t-service-provider-required')],
  employee: [(v: string) => !!v || t('t-employee-required')],
  issueDate: [(v: Date) => !!v || t('t-issue-date-required')],
  serviceProvisionDate: [(v: Date) => !!v || t('t-service-provision-date-required')],
  dueDate: [(v: Date) => !!v || t('t-due-date-required')],
  currency: [(v: string) => !!v || t('t-currency-required')],
  invoiceNumber: [(v: string) => !!v || t('t-invoice-number-required')],
  dependent: [(v: string) => invoiceData.value.isEmployeeInvoice ? true : !!v || t('t-dependent-required')],
  authorizedBy: [(v: string) => !!v || t('t-authorized-by-required')]
};

// Methods
const handleLoadError = (resource: string, error: any) => {
  console.error(`Failed to load ${resource}:`, error);
  errorMsg.value = t(`t-failed-to-load-${resource}`);

  if (alertTimeout.value) clearTimeout(alertTimeout.value);
  alertTimeout.value = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout.value = null;
  }, 5000);
};

const formatPlanMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${formatCurrency(value)} MT`;
};

const formatPlanPercent = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}%`;
};

const humanizeEnum = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());

const getTranslatedEnum = (prefix: string, value: string | null | undefined) => {
  if (!value) return "";
  const key = `${prefix}-${value.toString().toLowerCase().replace(/_/g, "-")}`;
  const translated = t(key);
  return translated === key ? humanizeEnum(value) : translated;
};

const getHealthPlanStatusLabel = (value: string | null | undefined) =>
  getTranslatedEnum("t", value) || "-";

const getLimitTypeDefinitionLabel = (value: string | null | undefined) =>
  value ? limitTypeDefinitionOptions.find(option => option.value === value)?.label || humanizeEnum(value) : "";

const getProcedureFixedAmount = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupFixedAmount, item.groupFixedAmount)
    : firstDefined(source.fixedAmount, item.fixedAmount);
};

const getProcedurePercentage = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupPercentage, item.groupPercentage)
    : firstDefined(source.percentage, item.percentage);
};

const getProcedureLimitLabel = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  const limitType = procedureUsesGroupLimit(procedure)
    ? firstDefined(source.hospitalProcedureGroupLimit, item.hospitalProcedureGroupLimit)
    : firstDefined(source.limitTypeDefinition, item.limitTypeDefinition);

  return getLimitTypeDefinitionLabel(limitType as string | null | undefined) || "-";
};

const getFrequencyLabel = (procedure: HospitalProcedureListingType | ExpensePerProcedureType | any) => {
  const source = getProcedureSource(procedure);
  const allowedFrequencyUse = firstDefined(source.allowedFrequencyUse, procedure.allowedFrequencyUse);
  const frequencyInterval = firstDefined(source.frequencyInterval, procedure.frequencyInterval);
  if (!allowedFrequencyUse || !frequencyInterval) return "-";

  const limitTypeLabel = getTranslatedEnum("t-limit-type", source.limitType || (procedure as any).limitType);
  return limitTypeLabel
    ? `${allowedFrequencyUse}/${frequencyInterval} ${limitTypeLabel}`
    : `${allowedFrequencyUse}/${frequencyInterval}`;
};

const formatPlanBalance = (value: number | string | null | undefined) =>
  formatPlanMoney(value);

const getProcedureAllocatedBalance = (procedure: ExpensePerProcedureType) =>
  getBalanceValue(procedure, "allocatedBalance", "groupAllocatedBalance");

const getProcedureTotalUsedBalance = (procedure: ExpensePerProcedureType) =>
  Number(firstDefined((procedure as any).totalUsedBalance) || 0);

const hasProcedureTotalUsedBalance = (procedure: ExpensePerProcedureType) =>
  getProcedureTotalUsedBalance(procedure) !== 0;

const getProcedureUsedBalance = (procedure: ExpensePerProcedureType) =>
  getProcedureTotalUsedBalance(procedure);

const getProcedureRemainingBalance = (procedure: ExpensePerProcedureType) =>
  getBalanceValue(procedure, "remainingBalance", "groupRemainingBalance");

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
  return procedure ? getProcedureAllocatedBalance(procedure) : null;
};

const getGroupUsedBalance = (procedures: ExpensePerProcedureType[]) => {
  const groupUsedBalances = procedures.map(procedure => Number(procedure.groupUsedBalance || 0));
  return groupUsedBalances.find(value => value !== 0) || 0;
};

const getGroupRemainingBalance = (procedures: ExpensePerProcedureType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureRemainingBalance(procedure) : null;
};

const getGroupLimitLabel = (procedures: ExpensePerProcedureType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureLimitLabel(procedure) : "-";
};

const getGroupFrequencyLabel = (procedures: ExpensePerProcedureType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getFrequencyLabel(procedure) : "-";
};

const getPlanUsedBalanceTotal = (procedures: ExpensePerProcedureType[]) => {
  const groupedProcedures = new Map<string, ExpensePerProcedureType[]>();
  let total = 0;

  procedures.forEach((procedure) => {
    if (procedureUsesGroupLimit(procedure)) {
      const groupKey = getProcedureGroupIdentity(procedure);
      groupedProcedures.set(groupKey, [...(groupedProcedures.get(groupKey) || []), procedure]);
      return;
    }

    total += getProcedureTotalUsedBalance(procedure);
  });

  groupedProcedures.forEach((groupProcedures) => {
    total += Number(getGroupUsedBalance(groupProcedures) || 0);
  });

  return total;
};

const onConsultHealthPlan = async () => {
  if (!canConsultHealthPlan.value) {
    toast.error("Sem permissao para consultar o plano de saude.");
    return;
  }

  if (!invoiceData.value.employee) {
    toast.error(t("t-employee-required"));
    return;
  }

  if (!invoiceData.value.isEmployeeInvoice && !invoiceData.value.dependent) {
    toast.error(t("t-dependent-required"));
    return;
  }

  healthPlanConsultLoading.value = true;
  healthPlanProcedureSearch.value = "";

  try {
    const memberFilters = {
      isEmployee: invoiceData.value.isEmployeeInvoice,
      dependentId: invoiceData.value.isEmployeeInvoice ? undefined : invoiceData.value.dependent
    };

    await hospitalProcedureBalanceStore.fetchProcedures(
      invoiceData.value.employee,
      {
        page: 0,
        size: 1000000000,
        sortColumn: "createdAt",
        direction: "asc",
        query_value: "",
        query_props: "hospitalProcedureType.code,hospitalProcedureType.name,allocatedBalance,usedBalance,totalUsedBalance,remainingBalance,groupAllocatedBalance,groupUsedBalance,groupRemainingBalance,belongsToGroup,frequencyInterval,lastUsageDate,allowedFrequencyUse,contractHealthPlanHospitalProcedures.fixedAmount,contractHealthPlanHospitalProcedures.percentage,contractHealthPlanHospitalProcedures.limitTypeDefinition,contractHealthPlanHospitalProcedures.belongsToGroup,contractHealthPlanHospitalProcedures.groupFixedAmount,contractHealthPlanHospitalProcedures.groupPercentage,contractHealthPlanHospitalProcedures.hospitalProcedureGroupLimit,companyHealthPlanHospitalProcedures.fixedAmount,companyHealthPlanHospitalProcedures.percentage,companyHealthPlanHospitalProcedures.limitTypeDefinition,companyHealthPlanHospitalProcedures.belongsToGroup,companyHealthPlanHospitalProcedures.groupFixedAmount,companyHealthPlanHospitalProcedures.groupPercentage,companyHealthPlanHospitalProcedures.hospitalProcedureGroupLimit"
      }
    );

    const activeEmployeeHealthPlan = hospitalProcedureBalanceStore.activeHealthPlan;
    const content = getInvoiceMemberProcedureLimits(hospitalProcedureBalanceStore.expensePerProcedure);

    if (!activeEmployeeHealthPlan?.id || !content.length) {
      employeeActiveHealthPlan.value = null;
      employeePlanProcedureLimits.value = [];
      toast.error(t("t-no-active-health-plan"));
      return;
    }

    employeeActiveHealthPlan.value = content[0]?.employeeHealthPlan || activeEmployeeHealthPlan;
    employeePlanProcedureLimits.value = orderHealthPlanProcedures(content, t("t-procedures"));
    healthPlanDialog.value = true;
  } catch (error) {
    console.error("Erro ao consultar plano activo:", error);
    toast.error(t("t-no-active-health-plan"));
  } finally {
    healthPlanConsultLoading.value = false;
  }
};

const onExportHealthPlanPdf = async () => {
  if (!activePlanProcedures.value.length || !employeeActiveHealthPlan.value) {
    toast.error(t("t-no-active-health-plan"));
    return;
  }

  healthPlanPdfExporting.value = true;
  try {
    await exportHealthPlanToPdf({
      healthPlan: {
        ...activeHealthPlan.value,
        ...employeeActiveHealthPlan.value
      },
      procedures: activePlanProcedures.value as any,
      contextLabel: employees.value.find(item => item.value === invoiceData.value.employee)?.label
        || invoiceData.value.employeeLabel
        || undefined,
      showUsageBalances: true
    });
  } catch (error) {
    console.error("Erro ao exportar plano de saude:", error);
    toast.error(t("t-message-save-error"));
  } finally {
    healthPlanPdfExporting.value = false;
  }
};

const submitInvoice = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t('t-validation-error'));
    return;
  }

  try {
    // Se houver itens, emite apenas eles (que já vão disparar o salvamento completo)
    if (productCardRef.value) {
      const itemsValid = productCardRef.value.emitItemsReady();
      if (!itemsValid) return;
    }
    // Se não houver itens, emite os dados básicos
    else {
      emit('save', { ...invoiceData.value });
    }
  } catch (error) {
    console.error("Error submitting invoice:", error);
    toast.error(t('t-message-save-error'));
  }
};

const handleItemsReady = (items: InvoiceItemInsertType[]) => {
  // SEMPRE atualiza o total, mesmo em modo edição
  const totalAmount = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  invoiceData.value.totalAmount = totalAmount;

  // Emite os itens com o total atualizado
  emit('items-ready', items);
};

const onBack = () => {
  institutionStore.clearDraft();
  router.push('/invoices/list');
};

const onNewInvoice = () => {
  if (!canCreateInvoice.value) return;

  invoiceStore.clearDraft();
  router.push('/invoices/create');
};

// Watchers
// Adicione este watcher para debug
watch(() => invoiceData.value, (newValue) => {
  // console.log('Invoice data structure:', {
  //   coveragePeriod: newValue.coveragePeriod,
  //   companyHealthPlanId: newValue.coveragePeriod?.companyHealthPlanId,
  //   fullData: newValue
  // });
}, { deep: true, immediate: true });

watch(() => invoiceData.value.company, async (newInstitutionId) => {
  if (newInstitutionId) {
    try {
      await employeeStore.fetchEmployeesForDropdown(newInstitutionId, 0, 10000000);

      if (invoiceData.value.employee) {
        const currentEmployee = employeeStore.employeesForDropdown.find(
          c => c.id === invoiceData.value.employee
        );
        if (!currentEmployee && !invoiceData.value.employeeLabel) {
          invoiceData.value.employee = undefined;
        }
      }
    } catch (error) {
      handleLoadError("employees", error);
    }
  } else {
    employeeStore.clearEmployeesForDropdown();
    invoiceData.value.employee = undefined;
  }
}, { immediate: true });

watch(() => invoiceData.value.employee, async (newEmployeeId) => {
  employeeActiveHealthPlan.value = null;
  employeePlanProcedureLimits.value = [];
  healthPlanDialog.value = false;

  if (newEmployeeId) {
    try {
      await dependentStore.fetchDependentsEmployeeForDropdown(newEmployeeId, 0, 10000000);

      if (invoiceData.value.dependent) {
        const currentDependent = dependentStore.dependentsForDropdown.find(
          c => c.id === invoiceData.value.dependent
        );
        if (!currentDependent && !invoiceData.value.dependentLabel) {
          invoiceData.value.dependent = undefined;
        }
      }
    } catch (error) {
      handleLoadError("dependents", error);
    }
  } else {
    dependentStore.clearDependentForDropdown();
    invoiceData.value.dependent = undefined;
  }
}, { immediate: true });

const onDownloadClick = (id: string | undefined, name: string, extension: string) => {
  if (!id) return;
  onSubmitDownloadInvoice(id, name, extension);
};

const onSubmitDownloadInvoice = async (invoiceId: string, name: string, extension: string, callbacks?: {
  onSuccess?: () => void;
  onFinally?: () => void;
}) => {
  try {
    const response = await invoiceService.downloadAttachment(invoiceId, name, extension);

    if (response.status === "error") {
      toast.error(response.error?.message || t("t-message-download-error"));
      return;
    }

    //toast.success(t("t-toast-message-downloaded"));
    callbacks?.onSuccess?.();
  } catch (error) {
    toast.error(t("t-message-download-error"));
  } finally {
    callbacks?.onFinally?.();
  }
};
// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      institutionStore.fetchInstitutionsforListing(0, 1000000000),
      currencyStore.fetchCurrenciesForDropdown(0, 1000000000),
      serviceProviderStore.fetchServiceProvidersForDropdown(0, 1000000000)
    ]);
  } catch (error) {
    handleLoadError("institutions", error);
  }
});
</script>

<template>
  <v-form ref="form">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <v-btn color="secondary" variant="outlined" @click="onBack">
        <i class="ph-arrow-left me-2" /> {{ $t('t-back-to-list') }}
      </v-btn>

      <div class="d-flex align-center justify-end flex-wrap ga-2">
        <v-btn
          v-if="canCreateInvoice"
          color="primary"
          variant="tonal"
          @click="onNewInvoice"
        >
          <i class="ph-plus-circle me-1" /> {{ $t('t-add-invoice') }}
        </v-btn>
      </div>
    </div>

    <v-card elevation="0" class="position-relative h-100 d-block">
      <v-card-title class="d-flex justify-start px-6 pt-4 pb-0">
        <Status :status="invoiceStatus" />
      </v-card-title>

      <v-card-text>
        <v-row class="mt-4 pt-16 pt-md-0">
          <v-col cols="12" lg="4" class="mt-6">
            <v-card class="bg-light" elevation="0" v-if="invoiceData.invoiceAttachment && invoiceData.id">
              <v-card-text class="py-3">
                <div class="d-flex justify-space-between">
                  <span class="font-weight-bold align-center d-flex">
                    <i class="ph ph-file me-2" /> {{ invoiceData.invoiceAttachment.originalFilename }}</span>
                  <span class="text-muted">{{ invoiceData.invoiceAttachment.fileSize }} KB</span>
                </div>
              </v-card-text>
            </v-card>

            <div class="mt-3" v-if="invoiceData.invoiceAttachment && invoiceData.id">
              <v-btn color="black" variant="elevated"
                @click="onDownloadClick(invoiceData.id, invoiceData.invoiceAttachment.originalFilename, invoiceData.invoiceAttachment.extension)"
                block>
                <span class="font-weight-bold align-center d-flex">
                  <i class="ph ph-download-simple me-2" /> {{ $t('t-download-original-invoice') }}
                </span>
              </v-btn>
            </div>

          </v-col>
          <v-col cols="12" lg="4" class="text-center">
            <h2 class="font-weight-bold mb-0"></h2>
          </v-col>
          <v-col cols="12" lg="4" justify="end">
            <div class="font-weight-bold">{{ $t('t-institution') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.company" :items="institutions" :loading="institutionStore.loading"
              :rules="requiredRules.institution" :placeholder="$t('t-institution')" disabled />

            <div class="font-weight-bold mt-n1">{{ $t('t-service-provider') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.serviceProvider" :items="service_providers" :loading="serviceProviderStore.loading"
              :rules="requiredRules.service_provider" :placeholder="$t('t-service-provider')" disabled />

            <div class="font-weight-bold">{{ $t('t-employee-or-dependent') }}</div>
            <v-checkbox v-model="invoiceData.isEmployeeInvoice" density="compact" color="primary" disabled>
              <template #label>
                <span>{{ $t('t-is-employee-invoice') }}</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>

        <v-row class="mt-n12">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold">{{ $t('t-invoice-number') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <TextField v-model="invoiceData.invoiceNumber" :placeholder="$t('t-enter-invoice-number')"
              :rules="requiredRules.invoiceNumber" disabled />
          </v-col>

          <v-col cols="12" lg="">
            <div class="font-weight-bold">{{ $t('t-employee') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.employee" :items="employees" :loading="employeeStore.loading"
              :rules="requiredRules.employee" :placeholder="$t('t-select-employee')" disabled />
          </v-col>

          <v-col cols="12" lg="4" v-if="!invoiceData.isEmployeeInvoice">
            <div class="font-weight-bold">{{ $t('t-dependent') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.dependent" :items="dependents" :loading="dependentStore.loading"
              :rules="requiredRules.dependent" :placeholder="$t('t-select-dependent')" disabled />
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <v-col cols="12" lg="3">
            <div class="font-weight-bold">{{ $t('t-service-provision-date') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <ValidatedDatePicker v-model="invoiceData.serviceProvisionDate" :teleport="true" :enable-time-picker="false"
              :rules="requiredRules.serviceProvisionDate" :placeholder="$t('t-select-service-provision-date')" disabled />
          </v-col>

          <v-col cols="12" lg="3">
            <div class="font-weight-bold">{{ $t('t-issue-date') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <ValidatedDatePicker v-model="invoiceData.issueDate" :teleport="true" :enable-time-picker="false"
              :rules="requiredRules.issueDate" :placeholder="$t('t-select-issue-date')" disabled />
          </v-col>

          <v-col cols="12" lg="3">
            <div class="font-weight-bold">{{ $t('t-currency') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.currency" :items="currencies" :rules="requiredRules.currency"
              :placeholder="$t('t-select-currency')" disabled />
          </v-col>

          <v-col cols="12" lg="3">
            <div class="font-weight-bold">{{ $t('t-due-date') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <ValidatedDatePicker v-model="invoiceData.dueDate" :teleport="true" :enable-time-picker="false"
              :rules="requiredRules.dueDate" :placeholder="$t('t-select-due-date')" disabled />
          </v-col>
        </v-row>

        <v-row class="mt-n6 mb-2">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold">{{ $t('t-invoice-reference') }}</div>
            <TextField v-model="invoiceData.invoiceReferenceNumber" :placeholder="$t('t-enter-invoice-reference')"
              disabled />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold">{{ $t('t-authorized-by') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <TextField v-model="invoiceData.authorizedBy" :placeholder="$t('t-enter-authorized-by')"
              :rules="requiredRules.authorizedBy" disabled />
          </v-col>
        </v-row>

        <v-row v-if="invoiceActionReasonName || invoiceData.notes" class="mt-n9 mb-2">
          <v-col v-if="invoiceActionReasonName" cols="12">
            <div class="font-weight-bold">{{ $t('t-reason') }}</div>
            <TextField
              :model-value="invoiceActionReasonName"
              :placeholder="$t('t-reason')"
              hide-details
              disabled
            />
          </v-col>

          <v-col v-if="invoiceData.notes" cols="12" class="mt-n3">
            <div class="font-weight-bold">{{ $t('t-reverse-invoice-notes-label') }}</div>
            <TextArea
              v-model="invoiceData.notes"
              :placeholder="$t('t-reverse-invoice-notes-placeholder')"
              hide-details
              disabled
            />
          </v-col>
        </v-row>

        <div class="mb-12">
          <ProductCard ref="productCardRef" v-model="invoiceItemData"
            :healthplan-id="invoiceHealthPlanId"
            :institution-id="invoiceData.company || ''" :initial-items="initialItems" :is-edit-mode="isEditMode"
            @items-ready="handleItemsReady" />
        </div>

      </v-card-text>

      <v-card-actions class="d-flex justify-space-between mt-5">
        <v-btn color="secondary" variant="outlined" class="me-4" @click="onBack">
          {{ $t('t-back-to-list') }} <i class="ph-arrow-left ms-2" />
        </v-btn>

        <v-btn
          v-if="canConsultHealthPlan"
          color="primary"
          variant="tonal"
          :disabled="!invoiceData.employee"
          :loading="healthPlanConsultLoading"
          @click="onConsultHealthPlan"
        >
          <i class="ph-first-aid-kit me-1" /> {{ $t('t-consult-health-plan') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>

  <v-dialog v-model="healthPlanDialog" max-width="1180" scrollable>
    <v-card class="health-plan-preview" elevation="12">
      <div class="health-plan-preview__hero">
        <div>
          <div class="text-overline text-primary font-weight-bold mb-1">
            {{ $t('t-health-plan') }}
          </div>
          <h3 class="text-h5 font-weight-bold mb-2">
            {{ activePlanCoveragePeriod }}
          </h3>
          <div class="d-flex align-center flex-wrap ga-2">
            <v-chip color="success" variant="flat" size="small">
              {{ getHealthPlanStatusLabel(employeeActiveHealthPlan?.status || activeHealthPlan?.status || 'ACTIVE') }}
            </v-chip>
            <span class="text-muted">
              {{ employees.find(item => item.value === invoiceData.employee)?.label || invoiceData.employeeLabel || '-' }}
            </span>
          </div>
        </div>

        <div class="d-flex align-center ga-2">
          <v-btn
            v-if="canConsultHealthPlan"
            color="primary"
            variant="tonal"
            :disabled="activePlanProcedures.length === 0"
            :loading="healthPlanPdfExporting"
            @click="onExportHealthPlanPdf"
          >
            <i class="ph-file-pdf me-1" /> Exportar PDF
          </v-btn>

          <v-btn icon variant="text" @click="healthPlanDialog = false">
            <i class="ph-x" />
          </v-btn>
        </div>
      </div>

      <v-card-text class="pt-0">
        <v-row class="mt-1">
          <v-col cols="12" md="3">
            <div class="plan-metric">
              <span>Saldo alocado</span>
              <strong>{{ formatPlanBalance(planAllocatedBalance) }}</strong>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="plan-metric">
              <span>Gasto</span>
              <strong>{{ formatPlanBalance(planUsedBalance) }}</strong>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="plan-metric plan-metric--success">
              <span>Remanescente</span>
              <strong>{{ formatPlanBalance(planRemainingBalance) }}</strong>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="plan-metric">
              <span>{{ $t('t-procedures') }}</span>
              <strong>{{ activePlanProcedures.length }}</strong>
            </div>
          </v-col>
        </v-row>

        <div class="d-flex align-center justify-space-between flex-wrap ga-3 mt-5 mb-4">
          <div>
            <h4 class="text-subtitle-1 font-weight-bold mb-1">
              {{ $t('t-procedures') }}
            </h4>
            <p class="text-muted mb-0">{{ activePlanProcedures.length }} {{ $t('t-procedures').toLowerCase() }}</p>
          </div>

          <v-text-field
            v-model="healthPlanProcedureSearch"
            class="plan-search"
            density="compact"
            hide-details
            variant="outlined"
            prepend-inner-icon="ph-magnifying-glass"
            :placeholder="$t('t-search-for-hospital-procedures')"
          />
        </div>

        <v-progress-linear v-if="healthPlanConsultLoading" color="primary" indeterminate rounded class="mb-4" />

        <v-alert
          v-if="!healthPlanConsultLoading && filteredPlanProcedures.length === 0"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          {{ $t('t-no-procedures-found') }}
        </v-alert>

        <div v-else class="procedure-table-wrap">
          <v-table density="compact" fixed-header height="560" class="procedure-table">
            <thead>
              <tr>
                                            <th style="width: 7%">Codigo</th>
                                            <th style="width: 22%">{{ $t('t-procedures') }}</th>
                                            <th style="width: 10%">{{ $t('t-fixed-amount') }}</th>
                                            <th style="width: 8%">{{ $t('t-percentage') }}</th>
                                            <th style="width: 10%">Alocado</th>
                                            <th style="width: 9%">Gasto</th>
                                            <th style="width: 11%">Remanescente</th>
                                            <th style="width: 12%">{{ $t('t-limit-type') }}</th>
                                            <th style="width: 11%">{{ $t('t-frequency-interval') }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="group in groupedPlanProcedureGroups" :key="group.group">
                <tr class="group-row">
                  <td colspan="9">
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
                <tr v-if="groupUsesGroupLimit(group.procedures)" class="group-limit-row">
                  <td colspan="2">Limite do grupo</td>
                  <td>{{ formatPlanMoney(getGroupFixedAmount(group.procedures)) }}</td>
                  <td>{{ formatPlanPercent(getGroupPercentage(group.procedures)) }}</td>
                  <td>{{ formatPlanBalance(getGroupAllocatedBalance(group.procedures)) }}</td>
                  <td>{{ formatPlanBalance(getGroupUsedBalance(group.procedures)) }}</td>
                  <td>{{ formatPlanBalance(getGroupRemainingBalance(group.procedures)) }}</td>
                  <td>{{ getGroupLimitLabel(group.procedures) }}</td>
                  <td>{{ getGroupFrequencyLabel(group.procedures) }}</td>
                </tr>

                <template v-for="category in group.categories" :key="`${group.group}-${category.category}`">
                  <tr class="category-row">
                    <td colspan="9">
                      <div class="d-flex align-center justify-space-between">
                        <span>
                          <i class="ph-folder-open me-2" />
                          {{ category.category }}
                        </span>
                        <span class="text-caption">{{ category.procedures.length }} {{ $t('t-procedures').toLowerCase() }}</span>
                      </div>
                    </td>
                  </tr>

                  <tr v-for="procedure in category.procedures" :key="procedure.id" class="procedure-row">
                    <td class="font-weight-medium text-primary">
                      {{ getProcedureCode(procedure) || '-' }}
                    </td>
                    <td>
                      <div class="font-weight-medium">{{ getProcedureName(procedure) }}</div>
                    </td>
                    <template v-if="procedureUsesGroupLimit(procedure)">
                      <td class="text-muted">-</td>
                      <td class="text-muted">-</td>
                      <td class="text-muted">-</td>
                      <td :class="{ 'text-muted': !hasProcedureTotalUsedBalance(procedure) }">
                        {{ hasProcedureTotalUsedBalance(procedure) ? formatPlanBalance(getProcedureTotalUsedBalance(procedure)) : '-' }}
                      </td>
                      <td class="text-muted">-</td>
                      <td class="text-muted">-</td>
                      <td class="text-muted">-</td>
                    </template>
                    <template v-else>
                      <td>{{ formatPlanMoney(getProcedureFixedAmount(procedure)) }}</td>
                      <td>{{ formatPlanPercent(getProcedurePercentage(procedure)) }}</td>
                      <td>{{ formatPlanBalance(getProcedureAllocatedBalance(procedure)) }}</td>
                      <td>{{ formatPlanBalance(getProcedureUsedBalance(procedure)) }}</td>
                      <td>{{ formatPlanBalance(getProcedureRemainingBalance(procedure)) }}</td>
                      <td>{{ getProcedureLimitLabel(procedure) }}</td>
                      <td>{{ getFrequencyLabel(procedure) }}</td>
                    </template>
                  </tr>
                </template>
              </template>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.health-plan-preview {
  border-radius: 18px;
  overflow: hidden;
}

.health-plan-preview__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 20px;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-secondary), 0.08)),
    rgb(var(--v-theme-surface));
}

.plan-metric {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  padding: 16px;
}

.plan-metric span {
  display: block;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.78rem;
  margin-bottom: 4px;
}

.plan-metric strong {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.15rem;
}

.plan-metric--success strong {
  color: rgb(var(--v-theme-success));
}

.plan-search {
  max-width: 360px;
  min-width: 260px;
}

.procedure-table-wrap {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  overflow: hidden;
}

.procedure-table :deep(thead tr),
.procedure-table :deep(thead th) {
  background: rgb(var(--v-theme-primary)) !important;
}

.procedure-table :deep(thead th) {
  border-bottom: 3px solid rgba(var(--v-theme-on-primary), 0.32) !important;
  box-shadow: 0 3px 10px rgba(var(--v-theme-primary), 0.24);
  color: rgb(var(--v-theme-on-primary)) !important;
  font-size: 0.72rem;
  font-weight: 900 !important;
  height: 52px;
  letter-spacing: 0.01em;
  line-height: 1.25;
  padding: 12px 14px;
  position: sticky;
  text-transform: uppercase;
  top: 0;
  vertical-align: middle;
  z-index: 3;
}

.procedure-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.procedure-table :deep(td) {
  font-size: 0.76rem;
  line-height: 1.35;
  vertical-align: top;
  white-space: normal;
  word-break: break-word;
}

.procedure-table :deep(th) {
  white-space: normal;
}

.group-row td {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.4;
  padding: 12px 14px;
  vertical-align: middle;
}

.group-limit-row td {
  background: rgba(var(--v-theme-primary), 0.035);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.12);
  color: rgba(var(--v-theme-on-surface), 0.84);
  font-weight: 700;
  padding: 9px 14px;
  vertical-align: middle;
}

.group-limit-row td:first-child {
  color: rgb(var(--v-theme-primary));
  text-transform: uppercase;
}

.category-row td {
  background: rgba(var(--v-theme-on-surface), 0.032);
  color: rgba(var(--v-theme-on-surface), 0.78);
  font-weight: 700;
  line-height: 1.4;
  padding: 11px 14px;
  vertical-align: middle;
}

.procedure-row td {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}

.procedure-row:hover td {
  background: rgba(var(--v-theme-primary), 0.045);
}

@media (max-width: 600px) {
  .health-plan-preview__hero {
    padding: 20px;
  }

  .plan-search {
    max-width: 100%;
    min-width: 100%;
  }
}
</style>
