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

export type TopServiceTypesByClinicFilterType = {
  startDate?: Date | string;
  endDate?: Date | string;
};

export type TopServiceTypesByClinicReportType = ServiceProviderReportType[];

export type ServiceProviderComparisonFilterType = {
  serviceProvider1Id?: string | number;
  serviceProvider2Id?: string | number;
  coveragePeriodId?: string | number;
  startDate?: Date | string;
  endDate?: Date | string;
};

export type ServiceProviderComparisonReportType = ServiceProviderReportType[];
