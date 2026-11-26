import type { DataTableHeaderType } from "@/app/common/types/table.types";
import type { MenuSelectItemType } from "@/app/common/components/filters/types";

export const contractIntegrationHeader: DataTableHeaderType[] = [
  { title: "contract-integration-definition", key: "integrationDefinition.name", sortable: true },
  { title: "contract-integration-usage", key: "usage", sortable: true },
  { title: "contract-integration-model", key: "integrationModel", sortable: true },
  { title: "contract-integration-classification", key: "classificationType", sortable: true },
  { title: "contract-integration-settled-amount-mode", key: "settledAmountMode", sortable: true },
  { title: "is-enabled", key: "enabled", sortable: true },
  { title: "action", sortable: false, align: "end" },
];

export const integrationModelOptions: MenuSelectItemType[] = [
  { label: "t-contract-integration-model-consolidated", value: "CONSOLIDATED" },
  { label: "t-contract-integration-model-detailed", value: "DETAILED" },
];

export const classificationTypeOptions: MenuSelectItemType[] = [
  { label: "t-contract-integration-classification-cost-center", value: "COST_CENTER" },
  { label: "t-contract-integration-classification-no-cost-center", value: "NO_COST_CENTER" },
];

export const settledAmountModeOptions: MenuSelectItemType[] = [
  { label: "t-contract-integration-settled-amount-automatic", value: "AUTOMATIC" },
  { label: "t-contract-integration-settled-amount-manual", value: "MANUAL" },
];

export const deductionBaseOptions: MenuSelectItemType[] = [
  { label: "t-contract-integration-deduction-base-base-salary", value: "BASE_SALARY" },
  { label: "t-contract-integration-deduction-base-gross-salary", value: "GROSS_SALARY" },
  { label: "t-contract-integration-deduction-base-net-salary", value: "NET_SALARY" },
];

export const ACCOUNT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;
