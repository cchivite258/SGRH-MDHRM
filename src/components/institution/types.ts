export type InstitutionListingType = {
    id: string  ;
    code?: string | null;
    erpCode?: string | null;
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    incomeTaxNumber: string;
    companyDetailsId?: string | number | null;
    companyDetails?: {
        id: string | number;
        name: string;
        description?: string | null;
        address?: string | null;
        phone?: string | null;
        email?: string | null;
        website?: string | null;
        incomeTaxNumber?: string | null;
        institutionType?: { id: string | number; name: string } | null;
    } | null;
    responsibleId?: string | number | null;
    responsible?: {
        id: string | number;
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
    } | null;
    institutionType?: {
        id: number;
        name: string
    } | null;

    maxNumberOfDependents: number | null;
    childrenMaxAge: number | null;
    healthPlanLimit: string | null;
    fixedAmount: number | null;
    salaryComponent: string | null;
    companyContributionPercentage: number | null;

    createdAt: Date ;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
};

export type InstitutionResponseType = { 
    id: string  ;
    code?: string | null;
    erpCode?: string | null;
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    description?: string;
    incomeTaxNumber: string;
    companyDetailsId?: string | number | null;
    companyDetails?: {
        id: string | number;
        name: string;
        description?: string | null;
        address?: string | null;
        phone?: string | null;
        email?: string | null;
        website?: string | null;
        incomeTaxNumber?: string | null;
        institutionType?: { id: string | number; name: string } | null;
    } | null;
    responsibleId?: string | number | null;
    responsible?: {
        id: string | number;
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
    } | null;
    institutionType: {
        id: string;
        name: string
    } | undefined ;

    maxNumberOfDependents: number | null;
    childrenMaxAge: number | null;
    healthPlanLimit: string | null;
    fixedAmount: number | null;
    salaryComponent: string | null;
    companyContributionPercentage: number | null;

    createdAt: Date ;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
};

export type InstitutionInsertType = {
    code?: string | null;
    erpCode?: string | null;
    name: string;
    description: string | null;
    companyDetailsId: string | number | undefined;
    responsibleId: string | number | undefined;
    responsible?: {
        id: string | number;
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
    } | null;
    address?: string | null;
    phone?: string;
    email?: string;
    website: string | null;
    incomeTaxNumber?: string;
    institutionType?: string | undefined;

    maxNumberOfDependents?: number | null;
    childrenMaxAge?: number | null;
    healthPlanLimit?: string | undefined;
    fixedAmount?: number | null;
    salaryComponent?: string | undefined;
    companyContributionPercentage?: number | null;
    enabled: boolean;
}

export type ContractDocumentType =
  | "CONTRACT"
  | "CONTRACT_ADDENDUM"
  | "CONTRACT_TERMINATION"
  | "CONTRACT_RENEWAL"
  | "CONTRACT_AMENDMENT"
  | "COMMERCIAL_PROPOSAL"
  | "TECHNICAL_PROPOSAL"
  | "FINANCIAL_PROPOSAL";

export type ContractAttachmentType = {
  id: string;
  contractId?: string | number;
  contract?: any;
  contractDocumentType: ContractDocumentType;
  originalFilename?: string;
  name?: string;
  extension?: string;
  fileSize?: number;
  size?: number;
  attachment?: {
    id?: string;
    originalFilename?: string;
    contentType?: string;
    fileSize?: number;
    extension?: string;
    removable?: boolean;
    enabled?: boolean;
  } | null;
  fileMetadata?: {
    originalFilename?: string;
    name?: string;
    extension?: string;
    fileSize?: number;
    size?: number;
  } | null;
  removable: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
};

export type ContractAttachmentUploadType = {
  contractDocumentType: ContractDocumentType | "";
  file: File | null;
};

export type DepartmentInsertType = {
    id?: string | null;
    name: string;
    description: string | null;
    company: string;
    enabled: boolean;
}

export type DepartmentListingForListType = {
    id: string;
    name: string;
    description: string | null;
    company:  { id: string; [key: string]: any } ;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
}

export type DepartmentListingType = {
    id: string;
    name: string;
    description: string;
    company: any;
    institution: {
        id: string | number;
        name: string;
        description: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        deletedAt: Date | null;
        createdBy: string;
        updatedBy: string;
        deletedBy: string;
    },
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
};

export type PositionListingType = {
    id: string | number;
    name: string;
    description: string;
    department: {
        id: string | number;
        name: string;
        description: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        deletedAt: Date | null;
        createdBy: string;
        updatedBy: string;
        deletedBy: string;
    },
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
};

export type PositionInsertType = {
    id?: string | null;
    name: string;
    description: string | null;
    department: string;
    enabled: boolean;
}

export type PositionListingForListType = {
    id: string;
    name: string;
    description: string | null;
    department: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
}

export type ContactPersonListingType = {
    id: string;
    fullname: string;
    email: string;
    phone: string;
    company: string ;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
};

export type ContactPersonInsertType = {
    id?: string | null; 
    fullname: string;   
    email: string;
    phone: string;
    company: string; 
    enabled: boolean;
};

export type ServiceProviderListingType = {
    id: string;
    serviceProvider: {
        id: string | number;
        name: string;
        description: string;
        address?: string | null;
        phone?: string | null;
        email?: string | null;
        website?: string | null;
        incomeTaxNumber?: string | null;
        personOfContactFullname1?: string | null;
        personOfContactPhone1?: string | null;
        personOfContactEmail1?: string | null;
        personOfContactFullname2?: string | null;
        personOfContactPhone2?: string | null;
        personOfContactEmail2?: string | null;
        contractStartDate?: Date | string | null;
        contractEndDate?: Date | string | null;
        providerTypeId?: string | number | null;
        provinceId?: string | number | null;
        countryId?: string | number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        deletedAt: Date | null;
        createdBy: string;
        updatedBy: string;
        deletedBy: string;
    }
    company: string;
    isBusinessDays?: boolean | null;
    gracePeriod?: number | null;
    maxDaysAfterService?: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
};

export type ServiceProviderInsertType = {
    id?: string | null; 
    serviceProvider: string; 
    company: string; 
    isBusinessDays?: boolean | null;
    gracePeriod?: number | null;
    maxDaysAfterService?: number | null;
    enabled: boolean;
};

export type HospitalProcedureListingType = {
    id: string | undefined;
    fixedAmount: number | null;
    percentage: number | null;
    limitTypeDefinition: string;
    hospitalProcedureGroup?: string | { id?: string | number; name?: string; description?: string } | null;
    groupFixedAmount?: number | null;
    groupPercentage?: number | null;
    hospitalProcedureGroupLimit?: string | null;
    belongsToGroup?: boolean;
    limitType?: string | null;
    frequencyInterval?: number | null;
    allowedFrequencyUse?: number | null;
    hospitalProcedureType: any | undefined;
    companyHealthPlan: any | undefined;
    company: any;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
};

export type HospitalProcedureInsertType = {
    id?: string | undefined; 
    fixedAmount: number | null;
    percentage: number | null;
    limitTypeDefinition: string;
    hospitalProcedureGroup?: string | { id?: string | number; name?: string; description?: string } | null;
    groupFixedAmount?: number | null;
    groupPercentage?: number | null;
    hospitalProcedureGroupLimit?: string | null;
    belongsToGroup?: boolean;
    limitType?: string | null;
    frequencyInterval?: number | null;
    allowedFrequencyUse?: number | null;
    hospitalProcedureType: any | undefined;
    companyHealthPlan: any;
    company: any;
    enabled: boolean;
};


export type CoveragePeriodListingType = {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: string; 
    company: any;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
};

export type CoveragePeriodExtensionPayloadType = {
    id?: string | number;
    coveragePeriodId: string | number;
    endDate: Date | string | null;
    budgetAmount?: number | null;
    reasonId: string | number;
    notes: string;
};

export type CoveragePeriodExtensionType = {
    id: string | number;
    startDate: Date | string | null;
    endDate: Date | string | null;
    budgetAmount?: number | null;
    reasonId?: string | number;
    reason?: { id?: string | number; name?: string | null } | null;
    notes?: string | null;
    status: string;
    coveragePeriodId: string | number;
    coveragePeriod?: CoveragePeriodListingType;
    removable: boolean;
    enabled: boolean;
    createdAt: Date | string | null;
    updatedAt: Date | string | null;
    deletedAt: Date | string | null;
    createdBy: string | null;
    updatedBy: string | null;
    deletedBy: string | null;
};

export type CoveragePeriodInsertType = {
    id?: string | undefined; 
    name: string;
    startDate: Date;
    endDate: Date;
    company: any | undefined;
    enabled: boolean;
};


export type HealthPlanListingType = {
    id: string;
    maxNumberOfDependents: number | undefined;
    childrenInUniversityMaxAge: number | undefined;
    childrenMaxAge: number | undefined;
    healthPlanLimit: string | undefined;
    fixedAmount: number | undefined;
    salaryComponent: string | undefined;
    companyContributionPercentage: number | undefined;
    coveragePeriod: any
    company: any;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    status: string;
    enabled: boolean;
};

export type HealthPlanInsertType = {
    id?: string | undefined; 
    maxNumberOfDependents: number | undefined;
    childrenMaxAge: number | undefined;
    childrenInUniversityMaxAge: number | undefined;
    healthPlanLimit: string | undefined;
    fixedAmount: number | undefined;
    salaryComponent: string | undefined;
    companyContributionPercentage: number | undefined;
    coveragePeriod: any;
    company: any;
    enabled: boolean;
};

export type HealthPlanCloneType = {
    companyHealthPlan: string; 
    coveragePeriod: string;
    company: string;
    enabled: boolean;
}; 


export type BudgetInsertType = {
    id?: string | null;
    name: string;
    budgetAmount: number | undefined;
    coveragePeriod: string | undefined;
    budgetSpended?: number | undefined;
    totalAmountByCompanyEmployees?: number | undefined;
    coveragePeriodBudgetTransaction?: any[];
    enabled: boolean;
}

export type BudgetListingType = {
    id: string;
    name: string;
    budgetAmount: number | undefined;
    coveragePeriod: any;
    coveragePeriodId: string;
    budgetSpended: number | undefined;
    totalAmountByCompanyEmployees: number | undefined;
    coveragePeriodBudgetTransaction: any[];
    removable: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
}

export type TransactionType = {
  id: string
  invoiceId: string | null
  coveragePeriodBudgetId: string
  totalAmount: number
  postingOperation: string
  removable: boolean
  enabled: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}
