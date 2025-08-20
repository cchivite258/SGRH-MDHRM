
export type ClinicUpdateType = {
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
  enabled: boolean;
};


export type ClinicResponseType = {
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
  enabled: boolean;
};


export type ClinicInsertType = {
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
  enabled: boolean;
};

export type ClinicListingType = {
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
  enabled: boolean;
};

export type ClinicListingForListType = {
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
  enabled: boolean;
};
