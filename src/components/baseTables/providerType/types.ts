export type ProviderTypeInsert = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type ProviderTypeListing = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type ProviderTypeUpdate = {
  name: string;
  description: string;
  enabled: boolean;
};

export type ProviderTypeResponse = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type ProviderTypeOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: 'asc' | 'desc' }[];
  search: string;
};
