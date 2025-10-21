export type TaxRateTypeInsert = {
  id: string;
  name: string;
  description: string;
  rate: number;
  enabled: boolean;
};

export type TaxRateTypeListing = {
  id: string;
  name: string;
  description: string;
  rate: number;
  enabled: boolean;
};

export type TaxRateTypeUpdate = {
  name: string;
  description: string;
  rate: number;
  enabled: boolean;
};

export type TaxRateTypeResponse = {
  id: string;
  name: string;
  description: string;
  rate: number;
  enabled: boolean;
};

export type TaxRateTypeOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: 'asc' | 'desc' }[];
  search: string;
};
