import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type { RoleFormType, RoleListMeta, RoleListingType } from "@/components/users/roles/types";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: RoleListMeta;
  metadata?: RoleListMeta;
}

interface ServiceResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: unknown;
}

const ROLES_ENDPOINT = "/administration/iam/roles";

export default class RoleService extends HttpService {
  async getRoles(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "name",
    direction: string = "asc",
    queryValue?: string,
    queryProps?: string
  ): Promise<{ content: RoleListingType[]; meta: RoleListMeta }> {
    try {
      const url = `${ROLES_ENDPOINT}?${this.buildListQuery(page, size, sortColumn, direction, queryValue, queryProps)}`;
      const response = await this.get<ApiResponse<RoleListingType[]>>(url);
      const content = response.data || response.content || [];

      return {
        content,
        meta: response.meta || response.metadata || this.defaultMeta(page, size, content.length),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findRoleById(id: string): Promise<RoleListingType> {
    try {
      const response = await this.get<ApiResponse<RoleListingType>>(`${ROLES_ENDPOINT}/${id}`);
      return (response.data ?? response.content) as RoleListingType;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createRole(data: RoleFormType): Promise<ServiceResponse<RoleListingType>> {
    try {
      const response = await this.post<ApiResponse<RoleListingType>>(ROLES_ENDPOINT, {
        name: data.name,
        description: data.description,
      });

      return {
        status: "success",
        data: response.data ?? response.content,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateRole(id: string, data: RoleFormType): Promise<RoleListingType> {
    try {
      const response = await this.put<ApiResponse<RoleListingType>>(`${ROLES_ENDPOINT}/${id}`, {
        name: data.name,
        description: data.description,
      });

      return (response.data ?? response.content) as RoleListingType;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      await this.delete(`${ROLES_ENDPOINT}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private buildListQuery(
    page: number,
    size: number,
    sortColumn: string,
    direction: string,
    queryValue?: string,
    queryProps?: string
  ) {
    const queryParams = [
      `page=${page}`,
      `size=${size}`,
      `sortColumn=${encodeURIComponent(sortColumn)}`,
      `direction=${encodeURIComponent(direction)}`,
    ];

    if (queryValue && queryProps) {
      queryParams.push(`query_props=${encodeURIComponent(queryProps)}`);
      queryParams.push("query_operator=OR");
      queryParams.push(`query_value=${encodeURIComponent(queryValue)}`);
    }

    return queryParams.join("&");
  }

  private defaultMeta(page: number, size: number, totalElements: number): RoleListMeta {
    return {
      page,
      size,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
    };
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
