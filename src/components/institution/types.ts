export type InstitutionListingType = {
    id: string  ;
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    incomeTaxNumber: string;
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
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    description?: string;
    incomeTaxNumber: string;
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
    name: string;
    address: string | null;
    phone: string;
    email: string;
    website: string | null;
    description: string | null;
    incomeTaxNumber: string;
    institutionType: string | undefined;

    maxNumberOfDependents: number | null;
    childrenMaxAge: number | null;
    healthPlanLimit: string | undefined;
    fixedAmount: number | null;
    salaryComponent: string | undefined;
    companyContributionPercentage: number | null;
    enabled: boolean;
}

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

export type ClinicListingType = {
    id: string;
    clinic: {
        id: string | number;
        name: string;
        description: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        deletedAt: Date | null;
        createdBy: string;
        updatedBy: string;
        deletedBy: string;
    }
    company: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
};

export type ClinicInsertType = {
    id?: string | null; 
    clinic: string; 
    company: string; 
    enabled: boolean;
};

export type HospitalProcedureListingType = {
    id: string | undefined;
    fixedAmount: number | null;
    percentage: number | null;
    limitTypeDefinition: string;
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
    company: string ;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
    enabled: boolean;
};

export type CoveragePeriodInsertType = {
    id?: string | undefined; 
    name: string;
    startDate: Date;
    endDate: Date;
    company: string;
    enabled: boolean;
};


export type HealthPlanListingType = {
    id: string;
    maxNumberOfDependents: number | undefined;
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
