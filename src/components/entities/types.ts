export type EntityListingType = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string;
  email: string;
  website: string | null;
  incomeTaxNumber: string;
  institutionType?: {
    id: number | string;
    name: string;
  } | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdBy: string;
  updatedBy: string;
  deletedBy: string;
};

export type EntityResponseType = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string;
  email: string;
  website: string | null;
  incomeTaxNumber: string;
  institutionType?: {
    id: number | string;
    name: string;
  } | null;
  enabled: boolean;
};

export type EntityInsertType = {
  name: string;
  description: string | null;
  address: string | null;
  phone: string;
  email: string;
  website: string | null;
  incomeTaxNumber: string;
  institutionType: string | number | undefined;
  enabled: boolean;
};
