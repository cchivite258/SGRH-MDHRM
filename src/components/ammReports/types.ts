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