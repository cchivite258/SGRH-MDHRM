
export type ServiceProviderUpdateType = {
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
  providerTypes?: {
    id: number;
    name: string
  } | undefined;
  enabled: boolean;
};


export type ServiceProviderResponseType = {
  id: string;
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
