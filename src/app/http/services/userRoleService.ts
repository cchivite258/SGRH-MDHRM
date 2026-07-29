import axios from "@/app/http/axios";
import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type {
  UserRoleCreateType,
  UserRoleListingType,
} from "@/components/users/userRoles/types";

interface ApiResponse<T> {
  data?: T;
  content?: T;
}

const USER_ROLES_ENDPOINT = "/administration/iam/user-roles";

export default class UserRoleService extends HttpService {
  async getUserRolesByUser(userId: string): Promise<UserRoleListingType[]> {
    try {
      const params = new URLSearchParams({
        page: "0",
        size: "10000000",
        sortColumn: "id",
        direction: "asc",
        query_props: "user.id",
        query_value: userId,
        query_operator: "AND",
        includes: "user,role",
      });

      const response = await this.get<ApiResponse<UserRoleListingType[]>>(
        `${USER_ROLES_ENDPOINT}?${params.toString()}`
      );

      return response.data || response.content || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findUserRoleById(id: number): Promise<UserRoleListingType> {
    try {
      const response = await this.get<ApiResponse<UserRoleListingType>>(`${USER_ROLES_ENDPOINT}/${id}`);
      return (response.data ?? response.content) as UserRoleListingType;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createManyUserRoles(data: UserRoleCreateType[]): Promise<void> {
    try {
      await this.post(`${USER_ROLES_ENDPOINT}/many`, data as unknown as Record<string, any>);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteManyUserRoles(ids: number[]): Promise<void> {
    try {
      await axios.delete(USER_ROLES_ENDPOINT, {
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
        message: error.response.data?.message || "Erro na requisicao",
        detail: error.response.data?.detail,
        errors: error.response.data?.errors,
        error: error.response.data?.error || null,
        status: error.response.status,
      };
    }

    return {
      message: error?.message || "Erro de conexao",
      error: null,
      status: 503,
    };
  }
}
