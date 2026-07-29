import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type { PermissionListingType, PermissionListMeta } from "@/components/users/permissions/types";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: PermissionListMeta;
  metadata?: PermissionListMeta;
}

const PERMISSIONS_ENDPOINT = "/administration/iam/permissions";

export default class PermissionService extends HttpService {
  async getPermissions(
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = "name",
    direction: string = "asc",
    queryValue?: string,
    queryProps?: string
  ): Promise<{ content: PermissionListingType[]; meta: PermissionListMeta }> {
    try {
      const url = `${PERMISSIONS_ENDPOINT}?${this.buildListQuery(page, size, sortColumn, direction, queryValue, queryProps, "module")}`;
      const response = await this.get<ApiResponse<PermissionListingType[]>>(url);
      const content = response.data || response.content || [];

      return {
        content,
        meta: response.meta || response.metadata || this.defaultMeta(page, size, content.length),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPermissionsByModule(
    moduleId: number,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = "name",
    direction: string = "asc",
    queryValue?: string,
    queryProps?: string
  ): Promise<{ content: PermissionListingType[]; meta: PermissionListMeta }> {
    try {
      const url = `${PERMISSIONS_ENDPOINT}/by-module/${moduleId}?${this.buildListQuery(page, size, sortColumn, direction, queryValue, queryProps, "module")}`;
      const response = await this.get<ApiResponse<PermissionListingType[]>>(url);
      const content = response.data || response.content || [];

      return {
        content,
        meta: response.meta || response.metadata || this.defaultMeta(page, size, content.length),
      };
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
    queryProps?: string,
    relations?: string
  ) {
    const queryParams = [
      `page=${page}`,
      `size=${size}`,
      `sortColumn=${encodeURIComponent(sortColumn)}`,
      `direction=${encodeURIComponent(direction)}`,
    ];

    if (relations) {
      queryParams.push(`relations=${encodeURIComponent(relations)}`);
    }

    if (queryValue && queryProps) {
      queryParams.push(`query_props=${encodeURIComponent(queryProps)}`);
      queryParams.push("query_operator=OR");
      queryParams.push(`query_value=${encodeURIComponent(queryValue)}`);
    }

    return queryParams.join("&");
  }

  private defaultMeta(page: number, size: number, totalElements: number): PermissionListMeta {
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
