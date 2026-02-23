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