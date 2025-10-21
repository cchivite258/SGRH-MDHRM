
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
  serviceProviderType?: {
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
  contractEndDate: Date | undefined;
  contractStartDate: Date | undefined;
  serviceProviderType?: {
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
  contractEndDate: Date | undefined;
  contractStartDate: Date | undefined;
  serviceProviderType?: {
    id: number;
    name: string
  } | undefined;
  enabled: boolean;
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
  serviceProviderType?: {
    id: number;
    name: string
  } | undefined;
  enabled: boolean;
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
  serviceProviderType?: {
    id: number;
    name: string
  } | undefined;
  enabled: boolean;
};
