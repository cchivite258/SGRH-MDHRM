
export type ServiceProviderUpdateType = {
  code?: string | null;
  erpCode?: string | null;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  incomeTaxNumber: string;
  personOfContactFullname1: string;
  personOfContactPhone1: string;
  personOfContactEmail1: string;
  personOfContactFullname2: string;
  personOfContactPhone2: string;
  personOfContactEmail2: string;
  providerTypeId: string | undefined;
  responsibleId: string | undefined;
  responsible?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | undefined;
  isBusinessDays?: boolean | null;
  gracePeriod?: number | null;
  maxDaysAfterService?: number | null;
  providerTypes?: {
    id: number;
    name: string
  } | undefined;
  enabled: boolean;
};


export type ServiceProviderResponseType = {
  id: string;
  code?: string | null;
  erpCode?: string | null;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  incomeTaxNumber: string;
  personOfContactFullname1: string;
  personOfContactPhone1: string;
  personOfContactEmail1: string;
  personOfContactFullname2: string;
  personOfContactPhone2: string;
  personOfContactEmail2: string;
  providerTypeId: string | undefined;
  responsibleId: string | undefined;
  responsible?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | undefined;
  isBusinessDays?: boolean | null;
  gracePeriod?: number | null;
  maxDaysAfterService?: number | null;
  contractEndDate: Date | undefined;
  contractStartDate: Date | undefined;
  providerTypes?: {
    id: number;
    name: string
  } | undefined;
  enabled: boolean;
};


export type ServiceProviderInsertType = {
  id?: string | undefined;
  code?: string | null;
  erpCode?: string | null;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  incomeTaxNumber: string;
  personOfContactFullname1: string;
  personOfContactPhone1: string;
  personOfContactEmail1: string;
  personOfContactFullname2: string;
  personOfContactPhone2: string;
  personOfContactEmail2: string;
  providerTypeId: string | undefined;
  responsibleId: string | undefined;
  responsible?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | undefined;
  isBusinessDays?: boolean | null;
  gracePeriod?: number | null;
  maxDaysAfterService?: number | null;
  contractEndDate: Date | undefined;
  contractStartDate: Date | undefined;
  providerTypes?: {
    id: number;
    name: string
  } | undefined;
  enabled: boolean;
  provinceId: string | undefined;
  countryId: string | undefined;
};

export type ServiceProviderListingType = {
  id: string;
  code?: string | null;
  erpCode?: string | null;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  incomeTaxNumber: string;
  personOfContactFullname1: string;
  personOfContactPhone1: string;
  personOfContactEmail1: string;
  personOfContactFullname2: string;
  personOfContactPhone2: string;
  personOfContactEmail2: string;
  contractEndDate: Date | undefined;
  contractStartDate: Date | undefined;
  providerTypeId: string | undefined;
  responsibleId: string | undefined;
  responsible?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | undefined;
  isBusinessDays?: boolean | null;
  gracePeriod?: number | null;
  maxDaysAfterService?: number | null;
  providerTypes?: {
    id: number;
    name: string
  } | undefined;
  enabled: boolean;
  provinceId: string | undefined;
  countryId: string | undefined;
};

export type ServiceProviderListingForListType = {
  id: string;
  code?: string | null;
  erpCode?: string | null;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  incomeTaxNumber: string;
  personOfContactFullname1: string;
  personOfContactPhone1: string;
  personOfContactEmail1: string;
  personOfContactFullname2: string;
  personOfContactPhone2: string;
  personOfContactEmail2: string;
  contractEndDate: Date | undefined;
  contractStartDate: Date | undefined;
  providerTypeId: string | undefined;
  responsibleId: string | undefined;
  responsible?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | undefined;
  isBusinessDays?: boolean | null;
  gracePeriod?: number | null;
  maxDaysAfterService?: number | null;
  providerTypes?: {
    id: number;
    name: string
  } | undefined;
  enabled: boolean;
  provinceId: string | undefined;
  countryId: string | undefined;
};

export type ServiceProviderContractExtensionPayloadType = {
  id?: string | number;
  serviceProviderId: string | number;
  contractEndDate: Date | string | null;
  reasonId: string | number;
  notes: string;
  file?: File;
};

export type ServiceProviderContractExtensionType = {
  id: string | number;
  contractStartDate: Date | string | null;
  contractEndDate: Date | string | null;
  reasonId?: string | number;
  reason?: { id?: string | number; name?: string | null } | null;
  notes?: string | null;
  status: string;
  serviceProviderId: string | number;
  serviceProvider?: ServiceProviderListingType | null;
  removable: boolean;
  enabled: boolean;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  deletedAt: Date | string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
};

export type ServiceProviderDocumentType =
  | "CONTRACT"
  | "CONTRACT_ADDENDUM"
  | "SERVICE_LEVEL_AGREEMENT"
  | "NON_DISCLOSURE_AGREEMENT"
  | "COMMERCIAL_PROPOSAL"
  | "PURCHASE_ORDER"
  | "WORK_ORDER"
  | "AWARD_LETTER"
  | "SCOPE_OF_WORK"
  | "PROJECT_PLAN"
  | "IMPLEMENTATION_SCHEDULE"
  | "PRICE_LIST"
  | "BANK_GUARANTEE"
  | "INSURANCE_POLICY"
  | "LICENSE"
  | "CERTIFICATION"
  | "TAX_CLEARANCE_CERTIFICATE"
  | "SOCIAL_SECURITY_CLEARANCE"
  | "LEGAL_REPRESENTATION_DOCUMENT"
  | "TECHNICAL_SPECIFICATION"
  | "SERVICE_COMMENCEMENT_CERTIFICATE"
  | "SERVICE_ACCEPTANCE_CERTIFICATE"
  | "CONTRACT_TERMINATION"
  | "OTHER"
  | "AUTHORIZATION_LETTER"
  | "ACCREDITATION_CERTIFICATE"
  | "QUALITY_CERTIFICATE"
  | "COMPLIANCE_CERTIFICATE";

export type ServiceProviderAttachmentType = {
  id: string;
  serviceProviderAttachmentId?: string | number;
  serviceProviderId?: string | number;
  serviceProviderContractExtensionId?: string | number;
  serviceProviderDocumentType: ServiceProviderDocumentType;
  serviceProvider?: ServiceProviderListingType | null;
  serviceProviderContractExtension?: ServiceProviderContractExtensionType | null;
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
  originalFilename?: string;
  name?: string;
  extension?: string;
  fileSize?: number;
  size?: number;
  removable: boolean;
  enabled: boolean;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  deletedAt: Date | string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
};

export type ServiceProviderAttachmentUploadType = {
  serviceProviderDocumentType: ServiceProviderDocumentType | "";
  file: File | null;
};
