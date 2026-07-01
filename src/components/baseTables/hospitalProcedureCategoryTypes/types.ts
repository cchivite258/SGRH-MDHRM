export type EntityId = string | number;

export type HospitalProcedureCategoryTypesInsert = {
  hospitalProcedureTypeIds: EntityId[];
  hospitalProcedureCategorypId: EntityId;
};

export type HospitalProcedureCategoryTypesBulkDelete = {
  ids: EntityId[];
};

export type HospitalProcedureCategoryTypesListing = {
  id: EntityId;
  hospitalProcedureTypeId?: EntityId;
  hospitalProcedureCategoryId?: EntityId;
  hospitalProcedureCategorypId?: EntityId;
  hospitalProcedureType?: {
    id: EntityId;
    code?: string | null;
    name: string;
    description?: string | null;
    enabled?: boolean;
  };
  hospitalProcedureCategory?: {
    id: EntityId;
    name?: string;
    description?: string | null;
    enabled?: boolean;
  };
};
