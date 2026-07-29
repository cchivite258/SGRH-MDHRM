export type RoleListingType = {
  removable: boolean;
  enabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  id: string;
  name: string;
  description: string;
};

export type RoleFormType = {
  id?: string;
  name: string;
  description: string;
};

export type RoleListMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last?: boolean;
  timestamp?: string;
};

export type RoleFetchParams = {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: "asc" | "desc" }>;
  search?: string;
};
