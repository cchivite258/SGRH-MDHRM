import HttpService from "@/app/http/httpService";
import type {
  ReasonInsert,
  ReasonListing,
  ReasonResponse,
  ReasonType,
  ReasonUpdate,
} from "@/components/baseTables/reason/types";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: any;
  metadata?: any;
}

interface ServiceResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: unknown;
}

const REASONS_ENDPOINT = "/administration/setup/reasons";

export default class ReasonService extends HttpService {
  async getReasons(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "name",
    direction: string = "asc",
    query_value?: string,
    query_props?: string
  ): Promise<{ content: ReasonListing[]; meta: any }> {
    try {
      const url = `${REASONS_ENDPOINT}?${this.buildListQuery(page, size, sortColumn, direction, query_value, query_props)}`;
      const response = await this.get<ApiResponse<ReasonListing[]>>(url);

      return {
        content: response.data || response.content || [],
        meta: response.meta || response.metadata || {},
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getReasonsByType(
    type: ReasonType,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = "name",
    direction: string = "asc"
  ): Promise<{ content: ReasonListing[]; meta: any }> {
    try {
      const queryParams = [
        `type=${encodeURIComponent(type)}`,
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`,
      ];
      const response = await this.get<ApiResponse<ReasonListing[]>>(
        `${REASONS_ENDPOINT}/by-type?${queryParams.join("&")}`
      );

      return {
        content: response.data || response.content || [],
        meta: response.meta || response.metadata || {},
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findReasonById(id: string): Promise<ReasonResponse> {
    try {
      const response = await this.get<ApiResponse<ReasonResponse>>(`${REASONS_ENDPOINT}/${id}`);
      return (response.data ?? response.content) as ReasonResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createReason(data: ReasonInsert): Promise<ServiceResponse<ReasonResponse>> {
    try {
      const response = await this.post<ApiResponse<ReasonResponse>>(REASONS_ENDPOINT, {
        name: data.name,
        type: data.type,
        description: data.description,
        enabled: data.enabled,
      });

      return {
        status: "success",
        data: response.data,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateReason(id: string, data: ReasonUpdate): Promise<ReasonResponse> {
    try {
      const response = await this.put<ApiResponse<ReasonResponse>>(`${REASONS_ENDPOINT}/${id}`, {
        name: data.name,
        type: data.type,
        description: data.description,
        enabled: data.enabled,
      });
      return (response.data ?? response.content) as ReasonResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteReason(id: string): Promise<void> {
    try {
      await this.delete(`${REASONS_ENDPOINT}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private buildListQuery(
    page: number,
    size: number,
    sortColumn: string,
    direction: string,
    query_value?: string,
    query_props?: string
  ) {
    const queryParams = [
      `page=${page}`,
      `size=${size}`,
      `sortColumn=${sortColumn}`,
      `direction=${direction}`,
    ];

    if (query_value && query_props) {
      queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
      queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
    }

    return queryParams.join("&");
  }

  private handleError(error: any) {
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
