export type ReportType = {
  id: string;
  img: string | undefined;
  title: string;
  isChecked?: boolean;
};

export type CompanyHospitalProceduresBalanceType = {
  companyId: string | undefined;
  issueDateFrom?: Date;
  issueDateTo?: Date;
  coveragePeriodId?: string | undefined;
  company?: any;
  coveragePeriod?: any;
  procedureExpenses?: any;
  totalAmount?: number;
};

export type CostPerEmployeeType = {
  companyId?: string | undefined;
  company?: any;
  coveragePeriodId?: string | undefined;
  coveragePeriod?: any;
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
  companyId?: string | undefined;
  coveragePeriodId?: string | undefined;
  company?: {
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
  coveragePeriod?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status?: string;
    companyId?: number;
    closingDate?: string;
    companyHealthPlanId?: string;
  };
  fromDate?: Date| string;
  toDate?: Date | string;
  invoiceEmployeeSummaries?: InvoiceEmployeeSummaryType[];
}

export type ServiceProviderReportType = {
  companyId?: string | number;
  serviceProviderId?: string | number;
  coveragePeriodId?: string | number;
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
  companyId?: string | number;
  serviceProviderId?: string | number;
  coveragePeriodId?: string | number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type TotalBilledByProviderReportType = {
  serviceProviderId?: string | number;
  serviceProviderName?: string;
  serviceProviderTypeName?: string;
  companyId?: string | number;
  companyName?: string;
  totalBilled?: number;
  totalEmployees?: number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type TopServiceTypesByClinicFilterType = {
  companyId?: string | number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type TopServiceTypesByClinicReportType = ServiceProviderReportType[];

export type TotalBilledMedicalAssistanceFilterType = {
  companyId?: string | number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type TotalBilledMedicalAssistanceItemType = {
  serviceProviderId?: string | number;
  serviceProviderName?: string;
  serviceProviderTypeName?: string;
  companyId?: string | number;
  companyName?: string;
  totalBilled?: number;
  totalEmployees?: number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type TotalBilledMedicalAssistanceReportType = TotalBilledMedicalAssistanceItemType[];

export type ServiceProviderComparisonFilterType = {
  companyId?: string | number;
  serviceProvider1Id?: string | number;
  serviceProvider2Id?: string | number;
  coveragePeriodId?: string | number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type ServiceProviderComparisonReportType = ServiceProviderReportType[];

export type CompanyEmployeeLimitsFilterType = {
  companyId?: string | number;
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
  companyHealthPlanId?: string;
  healthPlanLimit?: string;
  fixedAmount?: number;
  salaryComponent?: string;
  companyContributionPercentage?: number;
  employeeHireDate?: string;
  employeeContractDurationType?: string;
  employeeTerminateDate?: string;
  monthlyDetails?: CompanyEmployeeLimitMonthlyDetailType[];
};

export type CompanyEmployeeLimitsReportType = {
  companyId?: number | string;
  companyName?: string;
  coveragePeriodId?: number | string;
  coveragePeriodName?: string;
  coveragePeriodStartDate?: string;
  coveragePeriodEndDate?: string;
  employees?: CompanyEmployeeLimitEmployeeType[];
};

export type EmployeeExpenseStatementFilterType = {
  companyId?: string | number;
  coveragePeriodId?: string | number;
  employeeId?: string;
};

export type EmployeeExpenseStatementDetailType = {
  invoiceId?: string;
  serviceProviderId?: string | number;
  serviceProviderName?: string;
  authorizedBy?: string;
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
  companyId?: string | number;
  companyName?: string;
  coveragePeriodId?: string | number;
  coveragePeriodName?: string;
  details?: EmployeeExpenseStatementDetailType[];
  totalAmount?: number;
  totalByCompany?: number;
  totalByEmployee?: number;
  totalToBeDesconted?: number;
};
