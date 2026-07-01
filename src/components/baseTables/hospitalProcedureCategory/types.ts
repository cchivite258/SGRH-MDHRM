export type HospitalProcedureCategoryInsert = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type HospitalProcedureCategoryListing = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type HospitalProcedureCategoryUpdate = {
  name?: string;
  description?: string;
  enabled: boolean;
};

export type HospitalProcedureCategoryResponse = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type HospitalProcedureCategoryOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: 'asc' | 'desc' }[];
  search: string;
};
