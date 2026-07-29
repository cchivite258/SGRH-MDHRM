import HttpService from "@/app/http/httpService";
import type {
  CodeConfigForm,
  CodeConfigId,
  CodeConfigListing,
} from "@/components/settings/codeConfig/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

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

const CODE_CONFIG_ENDPOINT = "/administration/setup/code-config";

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

const toPayload = (data: CodeConfigForm) => ({
  type: data.type,
  prefix: data.prefix,
  separator: data.separator,
  suffix: data.suffix,
  sequenceLength: data.sequenceLength,
  pattern: data.pattern,
  includesYear: data.includesYear,
  includesMonth: data.includesMonth,
});

export default class CodeConfigService extends HttpService {
  async getCodeConfigs(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "createdAt",
    direction: string = "asc",
    query_value?: string,
    query_props?: string
  ): Promise<{ content: CodeConfigListing[]; meta: any }> {
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

      const response = await this.get<ApiResponse<CodeConfigListing[]> | CodeConfigListing[]>(
        `${CODE_CONFIG_ENDPOINT}?${params.toString()}`
      );
      const content = getContent<CodeConfigListing>(response);

      return {
        content,
        meta: getMeta(response, content.length),
      };
    } catch (error) {
      console.error("Erro ao buscar configuracoes de codigos contratuais:", error);
      throw this.handleError(error);
    }
  }

  async getCodeConfigById(id: CodeConfigId): Promise<{ data: CodeConfigListing }> {
    try {
      const response = await this.get<ApiResponse<CodeConfigListing> | CodeConfigListing>(
        `${CODE_CONFIG_ENDPOINT}/${id}`
      );

      return {
        data: resolveItem(response),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCodeConfig(data: CodeConfigForm): Promise<ServiceResponse<CodeConfigListing>> {
    try {
      const response = await this.post<ApiResponse<CodeConfigListing>>(CODE_CONFIG_ENDPOINT, toPayload(data));

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: "error",
          error: error.response.data as ApiErrorResponse,
        };
      }

      return {
        status: "error",
        error: this.createNetworkErrorResponse(),
      };
    }
  }

  async updateCodeConfig(id: CodeConfigId, data: CodeConfigForm): Promise<ServiceResponse<CodeConfigListing>> {
    try {
      const response = await this.put<ApiResponse<CodeConfigListing> | CodeConfigListing>(
        `${CODE_CONFIG_ENDPOINT}/${id}`,
        toPayload(data)
      );

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: "error",
          error: error.response.data as ApiErrorResponse,
        };
      }

      return {
        status: "error",
        error: this.createNetworkErrorResponse(),
      };
    }
  }

  async deleteCodeConfig(id: CodeConfigId): Promise<void> {
    try {
      await this.delete(`${CODE_CONFIG_ENDPOINT}/${id}`);
    } catch (error) {
      console.error("Erro ao eliminar configuracao de codigo contratual:", error);
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

  private createNetworkErrorResponse(): ApiErrorResponse {
    return {
      status: "error",
      message: "Network error",
      error: {
        type: "ConnectionError",
        title: "Network Error",
        status: 503,
        detail: "Could not connect to server",
        instance: CODE_CONFIG_ENDPOINT,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
