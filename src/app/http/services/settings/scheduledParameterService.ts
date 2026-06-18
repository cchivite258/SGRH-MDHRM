import HttpService from "@/app/http/httpService";
import type {
  AlertConfigurationId,
  ScheduledParameterForm,
  ScheduledParameterListing,
} from "@/components/settings/alerts/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
  data?: T | ApiResponse<T>;
  content?: T;
  items?: T;
  meta?: any;
  metadata?: any;
}

interface ServiceResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: ApiErrorResponse;
}

const SCHEDULED_PARAMETERS_ENDPOINT = "/scheduler/scheduled-parameters";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object";
};

const getContent = <T>(response: ApiResponse<T[]> | T[] | null | undefined): T[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.content)) return response.content;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data)) return response.data;
  if (isRecord(response.data)) return getContent(response.data as ApiResponse<T[]>);

  return [];
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

  const nestedResponse = isRecord(response.data) ? response.data as ApiResponse<T[]> : null;
  const meta = response.metadata ?? response.meta ?? nestedResponse?.metadata ?? nestedResponse?.meta;
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
    if (isRecord(wrapped.data)) {
      return resolveItem(wrapped.data as ApiResponse<T>);
    }

    return (wrapped.data ?? wrapped.content) as T;
  }

  return response as T;
};

const toPayload = (data: ScheduledParameterForm) => ({
  scheduledJobId: data.scheduledJobId,
  type: data.type,
  value: data.value,
});

export default class ScheduledParameterService extends HttpService {
  async getScheduledParameters(
    scheduledJobId: AlertConfigurationId,
    page: number = 0,
    size: number = 100
  ): Promise<{ content: ScheduledParameterListing[]; meta: any }> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sortColumn: "createdAt",
        direction: "asc",
      });

      const response = await this.get<ApiResponse<ScheduledParameterListing[]> | ScheduledParameterListing[]>(
        `${SCHEDULED_PARAMETERS_ENDPOINT}/by-scheduled-job/${scheduledJobId}?${params.toString()}`
      );
      const content = getContent<ScheduledParameterListing>(response);

      return {
        content,
        meta: getMeta(response, content.length),
      };
    } catch (error) {
      console.error("Erro ao buscar parâmetros do alerta:", error);
      throw this.handleError(error);
    }
  }

  async getScheduledParameterById(id: AlertConfigurationId): Promise<{ data: ScheduledParameterListing }> {
    try {
      const response = await this.get<ApiResponse<ScheduledParameterListing> | ScheduledParameterListing>(
        `${SCHEDULED_PARAMETERS_ENDPOINT}/${id}`
      );

      return {
        data: resolveItem(response),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createScheduledParameter(data: ScheduledParameterForm): Promise<ServiceResponse<ScheduledParameterListing>> {
    try {
      const response = await this.post<ApiResponse<ScheduledParameterListing>>(
        SCHEDULED_PARAMETERS_ENDPOINT,
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

  async updateScheduledParameter(id: AlertConfigurationId, data: ScheduledParameterForm): Promise<ServiceResponse<ScheduledParameterListing>> {
    try {
      const response = await this.put<ApiResponse<ScheduledParameterListing> | ScheduledParameterListing>(
        `${SCHEDULED_PARAMETERS_ENDPOINT}/${id}`,
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

  async deleteScheduledParameter(id: AlertConfigurationId): Promise<void> {
    try {
      await this.delete(`${SCHEDULED_PARAMETERS_ENDPOINT}/${id}`);
    } catch (error) {
      console.error("Erro ao eliminar parâmetro do alerta:", error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || "Erro na requisição",
        error: error.response.data?.error || null,
        status: error.response.status,
        response: error.response,
      };
    }

    return {
      message: "Erro de conexão",
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
        instance: SCHEDULED_PARAMETERS_ENDPOINT,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
