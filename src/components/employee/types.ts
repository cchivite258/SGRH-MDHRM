import { StringMappingType } from "typescript";

export type EmployeeCountResponse = {
  data: number;
  meta: {
    timestamp: string;
  };
  status: string;
}

export type GenderCountItem = {
  gender: string;
  count: number;
}

export type GenderCountResponse = {
  data: GenderCountItem[];
  meta: any;
  status: string;
}

export type EmployeeListingType = {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  maritalStatus: string;
  birthDate: string;
  bloodGroup: string;
  placeOfBirth: string;
  nationality: string;
  incomeTaxNumber: string | null;
  socialSecurityNumber: string;
  address: string;
  country: {
    id: string | undefined;
    name: string;
  } | undefined;
  province: {
    id: string;
    name: string;
  } | undefined;
  postalCode: string;
  email: string;
  phone: string;
  mobile: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  idCardNumber: string;
  idCardIssuer: string;
  idCardExpiryDate: string;
  idCardIssuanceDate: string;
  passportNumber: string;
  passportIssuer: string;
  passportExpiryDate: string;
  passportIssuanceDate: string;
  position: {
    id: string;
    name: string;
  } | undefined,
  department: {
    id: string;
    name: string
  } | undefined,
  company: {
    id: string;
    name: string
  } | undefined,
  enabled: boolean;
  contractDurationType?: string | undefined;
  hireDate?: string | undefined;
  terminationDate?: string | undefined;
  rehireDate?: string | undefined;
  alertFlag: string | undefined;
};

export type EmployeeResponseType = { 
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  maritalStatus: string;
  birthDate: string;
  bloodGroup: string;
  placeOfBirth: string;
  nationality: string;
  incomeTaxNumber: string | null;
  socialSecurityNumber: string;
  address: string;
  country: {
    id: string | undefined;
    name: string;
  } | undefined;
  province: {
    id: string;
    name: string;
  } | undefined;
  postalCode: string;
  email: string;
  phone: string;
  mobile: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  idCardNumber: string;
  idCardIssuer: string;
  idCardExpiryDate: string;
  idCardIssuanceDate: string;
  passportNumber: string;
  passportIssuer: string;
  passportExpiryDate: string;
  passportIssuanceDate: string;
  position: {
    id: string;
    name: string;
  } | undefined,
  department: {
    id: string;
    name: string
  } | undefined,
  company: {
    id: string;
    name: string
  } | undefined,
  enabled: boolean;
  contractDurationType?: string | undefined;
  hireDate?: string | undefined;
  terminationDate?: string | undefined;
  rehireDate?: string | undefined;
  alertFlag: string | undefined;

};

export type EmployeeInsertType = {
  id?: string | undefined;
  employeeNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  maritalStatus: string | undefined;
  birthDate: string | undefined;
  bloodGroup: string;
  placeOfBirth: string;
  nationality: string;
  incomeTaxNumber: string | null;
  socialSecurityNumber: string | null;
  address: string;
  country: string | undefined;
  province: string | undefined;
  postalCode: string;
  email: string;
  phone: string;
  mobile: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  idCardNumber: string | null;
  idCardIssuer: string;
  idCardExpiryDate: string | undefined;
  idCardIssuanceDate: string | undefined;
  passportNumber: string | null;
  passportIssuer: string;
  passportExpiryDate: string | undefined;
  passportIssuanceDate: string | undefined;
  baseSalary?: number | null;
  company?: string | number | undefined;
  department?: string | undefined;
  enabled?: boolean;
  position?: string | undefined;
  contractDurationType?: string | undefined;
  hireDate?: string | undefined;
  terminationDate?: string | undefined;
  rehireDate?: string | undefined;
};


export type EmployeeUpdateType = {
  employeeNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  maritalStatus: string | null;
  birthDate: string;
  bloodGroup: string;
  placeOfBirth: string;
  nationality: string;
  incomeTaxNumber: string | null;
  socialSecurityNumber: string | null;
  address: string;
  country: string;
  province: string;
  postalCode: string;
  email: string;
  phone: string;
  mobile: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  idCardNumber: string | null;
  idCardIssuer: string;
  idCardExpiryDate: string;
  idCardIssuanceDate: string;
  passportNumber: string | null;
  passportIssuer: string;
  passportExpiryDate: string;
  passportIssuanceDate: string;
  baseSalary?: number | null;
  company?: string | null;
  department?: string | null;
  enabled?: boolean;
  position?: string | null;
  contractDurationType?: string | undefined;
  hireDate?: string | undefined;
  terminationDate?: string | undefined;
  rehireDate?: string | undefined;
};

export type DependentInsertType = {
  id: string | undefined;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  birthDate: Date | undefined;
  relationship: string;
  employee: string;
  idCardNumber: string;
  idCardIssuer: string;
  idCardExpiryDate: Date | undefined;
  idCardIssuanceDate: Date | undefined;
  enabled: boolean;
}

export type DependentListingType = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  birthDate: Date | undefined;
  relationship: string;
  employee: {
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
  };
  idCardNumber: string;
  idCardIssuer: string;
  idCardExpiryDate: Date | undefined;
  idCardIssuanceDate: Date | undefined;
  enabled: boolean;
}

export type HealthPlanListingType = {
  id: string | undefined;
  allocatedBalance: number | string;
  usedBalance: number | string;
  remainingBalance: number | string;
  employeeId?: string | undefined;
  employee?: any | undefined;
  companyHealthPlanId?: string;
  status?: string | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  closingDate?: Date | undefined;
  companyHealthPlan?: any | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  deletedAt?: Date | undefined;
  createdBy?: string | undefined;
  updatedBy?: string | undefined;
  deletedBy?: string | undefined;
  usages?: UsagesListingType[] | undefined;
}

export type UsagesListingType = {
  id: string;
  employeeId?: string;
  employee: any;
  companyHealthPlanId: string;
  billedAmount: string;
  memberPaidAmount: string;
  amountCovered: string;
}


