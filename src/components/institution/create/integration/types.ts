import type { IntegrationDefinitionSummary, IntegrationUsageType } from "@/components/settings/integration/types";

export type ContractIntegrationId = string | number;

export type IntegrationModel = "CONSOLIDATED" | "DETAILED";

export type ClassificationType = "COST_CENTER" | "NO_COST_CENTER";

export type SettledAmountMode = "AUTOMATIC" | "MANUAL";

export type DeductionBase = "BASE_SALARY" | "GROSS_SALARY" | "NET_SALARY";

export type ContractIntegrationForm = {
  id?: ContractIntegrationId;
  contractId: ContractIntegrationId | "";
  integrationDefinitionId: ContractIntegrationId | "";
  usage: IntegrationUsageType | "";
  integrationModel: IntegrationModel | "";
  classificationType: ClassificationType | "";
  projectCostAccount: string;
  companyCostAccount: string;
  settledAmountMode: SettledAmountMode | "";
  deductionLimitPercentage: number | null;
  deductionBase: DeductionBase | "";
  integrationDefinition?: IntegrationDefinitionSummary | null;
};

export type ContractIntegration = {
  id: ContractIntegrationId;
  contractId: ContractIntegrationId;
  usage: IntegrationUsageType;
  integrationDefinition?: IntegrationDefinitionSummary | null;
  integrationModel: IntegrationModel;
  classificationType: ClassificationType;
  projectCostAccount?: string | null;
  companyCostAccount?: string | null;
  settledAmountMode: SettledAmountMode;
  deductionLimitPercentage?: number | null;
  deductionBase?: DeductionBase | null;
  removable?: boolean;
  enabled?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
};
