export type EntityId = string | number;

export type HospitalProcedureGroupingInsert = {
  hospitalProcedureTypeIds: EntityId[];
  hospitalProcedureGroupId: EntityId;
};

export type HospitalProcedureGroupingByCategoryInsert = {
  hospitalProcedureCategoryId: EntityId;
  hospitalProcedureGroupId: EntityId;
};

export type HospitalProcedureGroupingListing = {
  id: EntityId;
  hospitalProcedureTypeId?: EntityId;
  hospitalProcedureGroupId?: EntityId;
  hospitalProcedureType?: {
    id: EntityId;
    code?: string | null;
    name: string;
    description?: string | null;
    categoryName?: string | null;
    categoryId?: EntityId | null;
    enabled?: boolean;
  };
  hospitalProcedureGroup?: {
    id: EntityId;
    name?: string;
  };
};
