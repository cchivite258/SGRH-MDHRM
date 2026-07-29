import axios from "@/app/http/axios";
import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type {
  RolePermissionCreateType,
  RolePermissionListingType,
} from "@/components/users/permissions/types";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: any;
  metadata?: any;
}

const ROLE_PERMISSIONS_ENDPOINT = "/administration/iam/role-permissions";

export default class RolePermissionService extends HttpService {
  async getRolePermissionsByRole(roleId: string): Promise<RolePermissionListingType[]> {
    try {
      const params = new URLSearchParams({
        page: "0",
        size: "10000000",
        sortColumn: "id",
        direction: "asc",
        query_props: "role.id",
        query_value: roleId,
        query_operator: "AND",
        includes: "role,permission,permission.module",
      });

      const response = await this.get<ApiResponse<RolePermissionListingType[]>>(
        `${ROLE_PERMISSIONS_ENDPOINT}?${params.toString()}`
      );

      return response.data || response.content || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createManyRolePermissions(data: RolePermissionCreateType[]): Promise<void> {
    try {
      await this.post(`${ROLE_PERMISSIONS_ENDPOINT}/many`, data as unknown as Record<string, any>);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteManyRolePermissions(ids: number[]): Promise<void> {
    try {
      await axios.delete(ROLE_PERMISSIONS_ENDPOINT, {
        data: ids,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiErrorResponse | {
    message: string;
    detail?: string;
    errors?: Record<string, string[]>;
    error: ApiErrorResponse["error"] | null;
    status: number;
  } {
    if (error?.response) {
      return {
        message: error.response.data?.message || "Erro na requisição",
        detail: error.response.data?.detail,
        errors: error.response.data?.errors,
        error: error.response.data?.error || null,
        status: error.response.status,
      };
    }

    return {
      message: error?.message || "Erro de conexão",
      error: null,
      status: 503,
    };
  }
}
