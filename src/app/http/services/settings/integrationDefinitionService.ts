import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type {
  IntegrationDefinitionForm,
  IntegrationDefinitionId,
  IntegrationDefinitionListing,
  IntegrationDefinitionSummary,
  IntegrationUsageType,
} from "@/components/settings/integration/types";

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

const INTEGRATION_DEFINITION_ENDPOINT = "/administration/setup/integration-definition";

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

const clean = (value?: string | null) => value?.trim() ?? "";

const assignWhenPresent = (payload: Record<string, any>, key: string, value?: string | null) => {
  const cleaned = clean(value);
  if (cleaned) payload[key] = cleaned;
};

const toPayload = (data: IntegrationDefinitionForm, mode: "create" | "update") => {
  const payload: Record<string, any> = {
    description: clean(data.description),
    baseUrl: clean(data.baseUrl),
    username: clean(data.username),
  };

  assignWhenPresent(payload, "name", data.name);
  assignWhenPresent(payload, "apiVersion", data.apiVersion);
  assignWhenPresent(payload, "tenant", data.tenant);
  assignWhenPresent(payload, "companyCode", data.companyCode);

  if (data.timeoutSeconds !== null && data.timeoutSeconds !== undefined && `${data.timeoutSeconds}` !== "") {
    payload.timeoutSeconds = Number(data.timeoutSeconds);
  }

  assignWhenPresent(payload, "password", data.password);

  if (mode === "create") {
    payload.application = data.application;
  }

  return payload;
};

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

export default class IntegrationDefinitionService extends HttpService {
  async getIntegrationDefinitions(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "createdAt",
    direction: string = "asc",
    query_value?: string,
    query_props?: string
  ): Promise<{ content: IntegrationDefinitionListing[]; meta: any }> {
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

      const response = await this.get<ApiResponse<IntegrationDefinitionListing[]> | IntegrationDefinitionListing[]>(
        `${INTEGRATION_DEFINITION_ENDPOINT}?${params.toString()}`
      );
      const content = getContent<IntegrationDefinitionListing>(response);

      return {
        content,
        meta: getMeta(response, content.length),
      };
    } catch (error) {
      console.error("Erro ao buscar integracoes:", error);
      throw this.handleError(error);
    }
  }

  async getIntegrationDefinitionById(id: IntegrationDefinitionId): Promise<{ data: IntegrationDefinitionListing }> {
    try {
      const response = await this.get<ApiResponse<IntegrationDefinitionListing> | IntegrationDefinitionListing>(
        `${INTEGRATION_DEFINITION_ENDPOINT}/${id}`
      );

      return {
        data: resolveItem(response),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAvailableIntegrationDefinitions(usage: IntegrationUsageType): Promise<IntegrationDefinitionSummary[]> {
    try {
      const params = new URLSearchParams({ usage });
      const response = await this.get<
        ApiResponse<IntegrationDefinitionSummary[]> | IntegrationDefinitionSummary[]
      >(`${INTEGRATION_DEFINITION_ENDPOINT}/available?${params.toString()}`);

      return getContent(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createIntegrationDefinition(
    data: IntegrationDefinitionForm
  ): Promise<ServiceResponse<IntegrationDefinitionListing>> {
    try {
      const response = await this.post<ApiResponse<IntegrationDefinitionListing>>(
        INTEGRATION_DEFINITION_ENDPOINT,
        toPayload(data, "create")
      );

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, INTEGRATION_DEFINITION_ENDPOINT);
    }
  }

  async updateIntegrationDefinition(
    id: IntegrationDefinitionId,
    data: IntegrationDefinitionForm
  ): Promise<ServiceResponse<IntegrationDefinitionListing>> {
    try {
      const response = await this.put<ApiResponse<IntegrationDefinitionListing> | IntegrationDefinitionListing>(
        `${INTEGRATION_DEFINITION_ENDPOINT}/${id}`,
        toPayload(data, "update")
      );

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, `${INTEGRATION_DEFINITION_ENDPOINT}/${id}`);
    }
  }

  async deleteIntegrationDefinition(id: IntegrationDefinitionId): Promise<void> {
    try {
      await this.delete(`${INTEGRATION_DEFINITION_ENDPOINT}/${id}`);
    } catch (error) {
      console.error("Erro ao eliminar integracao:", error);
      throw this.handleError(error);
    }
  }

  async activateIntegrationDefinition(id: IntegrationDefinitionId): Promise<ServiceResponse<IntegrationDefinitionListing>> {
    try {
      const response = await this.put<ApiResponse<IntegrationDefinitionListing> | IntegrationDefinitionListing>(
        `${INTEGRATION_DEFINITION_ENDPOINT}/${id}/activate`
      );

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, `${INTEGRATION_DEFINITION_ENDPOINT}/${id}/activate`);
    }
  }

  async deactivateIntegrationDefinition(id: IntegrationDefinitionId): Promise<ServiceResponse<IntegrationDefinitionListing>> {
    try {
      const response = await this.put<ApiResponse<IntegrationDefinitionListing> | IntegrationDefinitionListing>(
        `${INTEGRATION_DEFINITION_ENDPOINT}/${id}/deactivate`
      );

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, `${INTEGRATION_DEFINITION_ENDPOINT}/${id}/deactivate`);
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
