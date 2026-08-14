import type { ModuleListingType } from "@/components/users/modules/types";
import type { RoleListingType } from "@/components/users/roles/types";

export type PermissionListingType = {
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
  slug: string;
  description: string;
  module: ModuleListingType;
};

export type PermissionListMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last?: boolean;
  timestamp?: string;
};

export type RolePermissionCreateType = {
  roleId: string;
  permissionId: number;
};

export type RolePermissionListingType = {
  removable: boolean;
  enabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  id: number;
  role: RoleListingType;
  permission: PermissionListingType;
};
