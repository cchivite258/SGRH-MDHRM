export type IntegrationSourceCodeId = string | number;

export type IntegrationSourceCodeForm = {
  id?: IntegrationSourceCodeId;
  sourceLedger: string;
  sourceType: string;
  description: string;
  enabled: boolean;
};

export type IntegrationSourceCodeListing = IntegrationSourceCodeForm & {
  id: IntegrationSourceCodeId;
  removable?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export type IntegrationSourceCodeOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: "asc" | "desc" }[];
  search: string;
};
