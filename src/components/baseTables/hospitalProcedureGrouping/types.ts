export type EntityId = string | number;

export type HospitalProcedureGroupingInsert = {
  hospitalProcedureTypeIds: EntityId[];
  hospitalProcedureGroupId: EntityId;
};

export type HospitalProcedureGroupingListing = {
  id: EntityId;
  hospitalProcedureTypeId?: EntityId;
  hospitalProcedureGroupId?: EntityId;
  hospitalProcedureType?: {
    id: EntityId;
    name: string;
    description?: string | null;
    enabled?: boolean;
  };
  hospitalProcedureGroup?: {
    id: EntityId;
    name?: string;
  };
};
