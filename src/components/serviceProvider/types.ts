
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
  providerTypes?: {
    id: number;
    name: string
  } | undefined;
  enabled: boolean;
  provinceId: string | undefined;
  countryId: string | undefined;
};
