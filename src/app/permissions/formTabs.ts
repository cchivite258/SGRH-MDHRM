import { PERMISSIONS, type PermissionRequirement } from "@/app/permissions/constants";

export type PermissionedFormTab = {
  value: number;
  label: string;
  permissions: PermissionRequirement;
};

type CanAnyFn = (required?: PermissionRequirement) => boolean;

// Definimos as abas com a respectiva permissao de consulta num unico ponto.
// Assim o botao da aba e o conteudo do formulario usam sempre a mesma regra.
export const EMPLOYEE_FORM_TABS = [
  { value: 1, label: "t-general-information", permissions: PERMISSIONS.EMPLOYEE.FORM_IDENTIFICATION_VIEW },
  { value: 2, label: "t-institution-and-classification", permissions: PERMISSIONS.EMPLOYEE.FORM_INSTITUTION_VIEW },
  { value: 3, label: "t-salary-review", permissions: PERMISSIONS.EMPLOYEE.SALARY_REVIEW_VIEW },
  { value: 4, label: "t-dependents", permissions: PERMISSIONS.EMPLOYEE.DEPENDENTS_VIEW },
  { value: 5, label: "t-health-plan", permissions: PERMISSIONS.EMPLOYEE.HEALTH_PLAN_VIEW },
] as const satisfies readonly PermissionedFormTab[];

export const CONTRACT_FORM_TABS = [
  { value: 1, label: "t-institution-information", permissions: PERMISSIONS.CONTRACTS.ACCESS },
  { value: 2, label: "t-periods", permissions: PERMISSIONS.CONTRACTS.COVERAGE_PERIODS_VIEW },
  { value: 3, label: "t-health-plan", permissions: PERMISSIONS.CONTRACTS.HEALTH_PLANS_VIEW },
  {
    value: 4,
    label: "t-organizational-structure",
    permissions: [
      PERMISSIONS.CONTRACTS.DEPARTMENTS_VIEW,
      PERMISSIONS.CONTRACTS.DEPARTMENT_POSITIONS_VIEW,
    ],
  },
  { value: 5, label: "t-contact", permissions: PERMISSIONS.CONTRACTS.CONTACTS_VIEW },
  { value: 6, label: "t-service-providers", permissions: PERMISSIONS.CONTRACTS.SERVICE_PROVIDERS_VIEW },
  { value: 7, label: "t-employees", permissions: PERMISSIONS.CONTRACTS.EMPLOYEES_VIEW },
] as const satisfies readonly PermissionedFormTab[];

export const SERVICE_PROVIDER_FORM_TABS = [
  { value: 1, label: "t-general-information", permissions: PERMISSIONS.SERVICE_PROVIDERS.ACCESS },
  { value: 2, label: "t-contract", permissions: PERMISSIONS.SERVICE_PROVIDERS.ACCESS },
  { value: 3, label: "t-contacts-service-provider", permissions: PERMISSIONS.SERVICE_PROVIDERS.ACCESS },
] as const satisfies readonly PermissionedFormTab[];

export const getAllowedFormTabs = (
  tabs: readonly PermissionedFormTab[],
  canAny: CanAnyFn
): PermissionedFormTab[] => tabs.filter((tab) => canAny(tab.permissions));

export const getFirstAllowedFormStep = (
  tabs: readonly PermissionedFormTab[],
  canAny: CanAnyFn
) => getAllowedFormTabs(tabs, canAny)[0]?.value;

export const isFormStepAllowed = (
  tabs: readonly PermissionedFormTab[],
  step: number,
  canAny: CanAnyFn
) => getAllowedFormTabs(tabs, canAny).some((tab) => tab.value === step);
