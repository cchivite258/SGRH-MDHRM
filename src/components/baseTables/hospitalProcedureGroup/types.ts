export type HospitalProcedureGroupInsert = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type HospitalProcedureGroupListing = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type HospitalProcedureGroupUpdate = {
  name?: string;
  description?: string;
  enabled: boolean;
};

export type HospitalProcedureGroupResponse = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type HospitalProcedureGroupOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: 'asc' | 'desc' }[];
  search: string;
};
