import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type {
  IntegrationSourceCodeForm,
  IntegrationSourceCodeId,
  IntegrationSourceCodeListing,
} from "@/components/settings/integrationSourceCode/types";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: any;
  metadata?: any;
}

interface ServiceResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: ApiErrorResponse;
}

const INTEGRATION_SOURCE_CODE_ENDPOINT = "/administration/setup/integration-source-codes";

const getContent = <T>(response: ApiResponse<T[]> | T[]): T[] => {
  if (Array.isArray(response)) return response;
  return response.content ?? response.data ?? [];
};

const getMeta = <T>(response: ApiResponse<T[]> | T[], fallbackLength: number) => {
  if (Array.isArray(response)) {
    return {
      totalElements: fallbackLength,
      page: 0,
      size: fallbackLength || 10,
      totalPages: 1,
    };
  }

  const meta = response.metadata ?? response.meta;
  const resolvedSize = meta?.size ?? meta?.itemsPerPage ?? fallbackLength;
  const pageSize = resolvedSize || 10;

  return {
    totalElements: meta?.totalElements ?? fallbackLength,
    page: meta?.page ?? meta?.currentPage ?? 0,
    size: pageSize,
    totalPages: meta?.totalPages ?? Math.max(1, Math.ceil(fallbackLength / pageSize)),
  };
};

const resolveItem = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === "object" && ("data" in response || "content" in response)) {
    const wrapped = response as ApiResponse<T>;
    return (wrapped.data ?? wrapped.content) as T;
  }

  return response as T;
};

const toPayload = (data: IntegrationSourceCodeForm) => ({
  sourceLedger: data.sourceLedger.trim(),
  sourceType: data.sourceType.trim(),
  description: data.description.trim(),
  enabled: data.enabled,
});

const toServiceError = (error: any, instance: string): ServiceResponse<never> => {
  if (error?.response) {
    return {
      status: "error",
      error: error.response.data as ApiErrorResponse,
    };
  }

  return {
    status: "error",
    error: {
      status: "error",
      message: "Network error",
      error: {
        type: "ConnectionError",
        title: "Network Error",
        status: 503,
        detail: "Could not connect to server",
        instance,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
  };
};

export default class IntegrationSourceCodeService extends HttpService {
  async getIntegrationSourceCodes(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "sourceLedger",
    direction: string = "asc",
    query_value?: string,
    query_props?: string
  ): Promise<{ content: IntegrationSourceCodeListing[]; meta: any }> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sortColumn,
        direction,
      });

      if (query_value && query_props) {
        params.append("query_props", query_props);
        params.append("query_value", query_value);
      }

      const response = await this.get<ApiResponse<IntegrationSourceCodeListing[]> | IntegrationSourceCodeListing[]>(
        `${INTEGRATION_SOURCE_CODE_ENDPOINT}?${params.toString()}`
      );
      const content = getContent<IntegrationSourceCodeListing>(response);

      return {
        content,
        meta: getMeta(response, content.length),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAvailableIntegrationSourceCodes(): Promise<IntegrationSourceCodeListing[]> {
    try {
      const response = await this.get<
        ApiResponse<IntegrationSourceCodeListing[]> | IntegrationSourceCodeListing[]
      >(`${INTEGRATION_SOURCE_CODE_ENDPOINT}/available`);
      const content = getContent(response);

      return Array.isArray(content) ? content : [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getIntegrationSourceCodeById(id: IntegrationSourceCodeId): Promise<{ data: IntegrationSourceCodeListing }> {
    try {
      const response = await this.get<ApiResponse<IntegrationSourceCodeListing> | IntegrationSourceCodeListing>(
        `${INTEGRATION_SOURCE_CODE_ENDPOINT}/${id}`
      );

      return {
        data: resolveItem(response),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createIntegrationSourceCode(
    data: IntegrationSourceCodeForm
  ): Promise<ServiceResponse<IntegrationSourceCodeListing>> {
    try {
      const response = await this.post<ApiResponse<IntegrationSourceCodeListing>>(
        INTEGRATION_SOURCE_CODE_ENDPOINT,
        toPayload(data)
      );

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, INTEGRATION_SOURCE_CODE_ENDPOINT);
    }
  }

  async updateIntegrationSourceCode(
    id: IntegrationSourceCodeId,
    data: IntegrationSourceCodeForm
  ): Promise<ServiceResponse<IntegrationSourceCodeListing>> {
    const endpoint = `${INTEGRATION_SOURCE_CODE_ENDPOINT}/${id}`;

    try {
      const response = await this.put<ApiResponse<IntegrationSourceCodeListing> | IntegrationSourceCodeListing>(
        endpoint,
        toPayload(data)
      );

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, endpoint);
    }
  }

  async deleteIntegrationSourceCode(id: IntegrationSourceCodeId): Promise<void> {
    try {
      await this.delete(`${INTEGRATION_SOURCE_CODE_ENDPOINT}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || "Erro na requisicao",
        error: error.response.data?.error || null,
        status: error.response.status,
        response: error.response,
      };
    }

    return {
      message: "Erro de conexao",
      error: null,
      status: 503,
    };
  }
}
