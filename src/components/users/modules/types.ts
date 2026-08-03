export type ModuleListingType = {
  removable: boolean;
  enabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  id: number;
  name: string;
  description: string;
  permissions: string[];
};

export type ModuleListMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last?: boolean;
  timestamp?: string;
};

export type ModuleFetchParams = {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: "asc" | "desc" }>;
  search?: string;
};
