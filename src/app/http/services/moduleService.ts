import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type { ModuleListMeta, ModuleListingType } from "@/components/users/modules/types";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: ModuleListMeta;
  metadata?: ModuleListMeta;
}

const MODULES_ENDPOINT = "/administration/iam/modules";

export default class ModuleService extends HttpService {
  async getModules(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "name",
    direction: string = "asc",
    queryValue?: string,
    queryProps?: string
  ): Promise<{ content: ModuleListingType[]; meta: ModuleListMeta }> {
    try {
      const url = `${MODULES_ENDPOINT}?${this.buildListQuery(page, size, sortColumn, direction, queryValue, queryProps)}`;
      const response = await this.get<ApiResponse<ModuleListingType[]>>(url);
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

  private defaultMeta(page: number, size: number, totalElements: number): ModuleListMeta {
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
