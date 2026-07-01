export type HospitalProcedureTypeInsert = {
  id: string;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type HospitalProcedureTypeListing = {
  id: string;
  code: string;
  name: string;
  description: string;
  categoryName?: string | null;
  categoryId?: string | number | null;
  enabled: boolean;
};

export type HospitalProcedureTypeUpdate = {
  code?: string;
  name?: string;
  description?: string;
  enabled: boolean;
};

export type HospitalProcedureTypeResponse = {
  id: string;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type HospitalProcedureTypeOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: 'asc' | 'desc' }[];
  search: string;
};
