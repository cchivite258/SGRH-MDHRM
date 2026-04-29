export type ReportType = {
  id: string;
  img: string | undefined;
  title: string;
  isChecked?: boolean;
};

export type CompanyHospitalProceduresBalanceType = {
  contractId?: string | number;
  issueDateFrom?: Date;
  issueDateTo?: Date;
  coveragePeriodId?: string | undefined;
  contract?: any;
  organization?: any;
  coveragePeriod?: any;
  procedureExpenses?: any;
  totalAmount?: number;
};

export type CostPerEmployeeType = {
  contractId?: string | number;
  contract?: any;
  coveragePeriodId?: string | undefined;
  coveragePeriod?: any;
  organization?: any;
  fromDate?: Date;
  toDate?: Date;
  invoiceEmployeeSummaries?: any;
};


export type InvoiceEmployeeSummaryType = {
  employeeId: string;
  employeeName: string;
  totalAmount: number;
  totalInvoices: number;
}

export type CompanyCostPerEmployeeReportType = {
  contractId?: string | number;
  coveragePeriodId?: string | undefined;
  contract?: {
    id: number;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    incomeTaxNumber?: string;
    healthPlanLimit?: string;
  };
  organization?: {
    id: number;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    incomeTaxNumber?: string;
  };
  coveragePeriod?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status?: string;
    contractId?: number;
    closingDate?: string;
    contractHealthPlanId?: string;
  };
  fromDate?: Date| string;
  toDate?: Date | string;
  invoiceEmployeeSummaries?: InvoiceEmployeeSummaryType[];
}

export type ServiceProviderReportType = {
  contractId?: string | number;
  serviceProviderId?: string | number;
  coveragePeriodId?: string | number;
  contractName?: string;
  serviceProviderName?: string;
  serviceProviderTypeName?: string;
  totalEmployees?: number;
  totalAmount?: number;
  startDate?: Date | string;
  endDate?: Date | string;
  details?: {
    hospitalProcedureTypeId?: string | number;
    hospitalProcedureTypeName?: string;
    totalInvoiceItems?: number;
    totalEmployees?: number;
    totalBilled?: number;
  }[];
};

export type TotalBilledByProviderFilterType = {
  contractId?: string | number;
  serviceProviderId?: string | number;
  coveragePeriodId?: string | number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type TotalBilledByProviderReportType = {
  serviceProviderId?: string | number;
  serviceProviderName?: string;
  serviceProviderTypeName?: string;
  contractId?: string | number;
  contractName?: string;
  totalBilled?: number;
  totalEmployees?: number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type TopServiceTypesByClinicFilterType = {
  contractId?: string | number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type TopServiceTypesByClinicReportType = ServiceProviderReportType[];

export type TotalBilledMedicalAssistanceFilterType = {
  contractId?: string | number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type TotalBilledMedicalAssistanceItemType = {
  serviceProviderId?: string | number;
  serviceProviderName?: string;
  serviceProviderTypeName?: string;
  contractId?: string | number;
  contractName?: string;
  totalBilled?: number;
  totalEmployees?: number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type TotalBilledMedicalAssistanceReportType = TotalBilledMedicalAssistanceItemType[];

export type ServiceProviderComparisonFilterType = {
  contractId?: string | number;
  serviceProvider1Id?: string | number;
  serviceProvider2Id?: string | number;
  coveragePeriodId?: string | number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type ServiceProviderComparisonReportType = ServiceProviderReportType[];

export type CompanyEmployeeLimitsFilterType = {
  contractId?: string | number;
  coveragePeriodId?: string | number;
};

export type CompanyEmployeeLimitMonthlyDetailType = {
  year?: number;
  month?: number;
  totalAmount?: number;
};

export type CompanyEmployeeLimitEmployeeType = {
  employeeId?: string;
  employeeFirstName?: string;
  employeeLastName?: string;
  departmentName?: string;
  positionName?: string;
  employeeBaseSalary?: number;
  employeeGrossSalary?: number;
  contractHealthPlanId?: string;
  healthPlanLimit?: string;
  fixedAmount?: number;
  salaryComponent?: string;
  contractContributionPercentage?: number;
  employeeHireDate?: string;
  employeeContractDurationType?: string;
  employeeTerminateDate?: string;
  monthlyDetails?: CompanyEmployeeLimitMonthlyDetailType[];
};

export type CompanyEmployeeLimitsReportType = {
  contractId?: number | string;
  contractName?: string;
  coveragePeriodId?: number | string;
  coveragePeriodName?: string;
  coveragePeriodStartDate?: string;
  coveragePeriodEndDate?: string;
  employees?: CompanyEmployeeLimitEmployeeType[];
};

export type EmployeeExpenseStatementFilterType = {
  contractId?: string | number;
  coveragePeriodId?: string | number;
  employeeId?: string;
};

export type EmployeeExpenseStatementDetailType = {
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceIssueDate?: string;
  serviceProviderId?: string | number;
  serviceProviderName?: string;
  authorizedBy?: string;
  pacientName?: string;
  invoiceTotalAmount?: number;
  hospitalProcedureTypeName?: string[];
};

export type EmployeeExpenseStatementReportType = {
  employeeId?: string;
  employeeFirstName?: string;
  employeeLastName?: string;
  employeePositionId?: string | number;
  employeePositionName?: string;
  employeeDepartmentId?: string | number;
  employeeDepartmentName?: string;
  contractId?: string | number;
  contractName?: string;
  coveragePeriodId?: string | number;
  coveragePeriodName?: string;
  details?: EmployeeExpenseStatementDetailType[];
  totalAmount?: number;
  totalByContract?: number;
  totalByEmployee?: number;
  totalToBeDesconted?: number;
  employeeUsedBalance?: number;
  employeeRemaingBalance?: number;
  employeeAllocatedBalance?: number;
};
