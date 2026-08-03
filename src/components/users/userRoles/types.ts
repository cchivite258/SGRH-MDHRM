import type { RoleListingType } from "@/components/users/roles/types";
import type { UserListingType } from "@/components/users/types";

export type UserRoleCreateType = {
  userId: string;
  roleId: string;
};

export type UserRoleListingType = {
  id: number;
  userId?: string;
  roleId?: string;
  user?: UserListingType;
  role?: RoleListingType;
};
