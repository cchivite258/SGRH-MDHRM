import HttpService from "@/app/http/httpService";
import type {
  AlertConfigurationForm,
  AlertConfigurationId,
  AlertConfigurationListing,
} from "@/components/settings/alerts/types";
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

const ALERT_CONFIGURATIONS_ENDPOINT = "/crons/crons";

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

const toCreatePayload = (data: AlertConfigurationForm) => ({
  name: data.name,
  description: data.description,
  type: data.type,
  intervalDays: data.intervalDays,
  maxRetryCount: data.maxRetryCount,
});

const toUpdatePayload = (data: AlertConfigurationForm) => ({
  ...toCreatePayload(data),
});

export default class AlertConfigurationService extends HttpService {
  async getAlertConfigurations(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "createdAt",
    direction: string = "asc",
    query_value?: string,
    query_props?: string
  ): Promise<{ content: AlertConfigurationListing[]; meta: any }> {
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

      const response = await this.get<ApiResponse<AlertConfigurationListing[]> | AlertConfigurationListing[]>(
        `${ALERT_CONFIGURATIONS_ENDPOINT}?${params.toString()}`
      );
      const content = getContent<AlertConfigurationListing>(response);

      return {
        content,
        meta: getMeta(response, content.length),
      };
    } catch (error) {
      console.error("Erro ao buscar configuracoes de alertas:", error);
      throw this.handleError(error);
    }
  }

  async getAlertConfigurationById(id: AlertConfigurationId): Promise<{ data: AlertConfigurationListing }> {
    try {
      const response = await this.get<ApiResponse<AlertConfigurationListing> | AlertConfigurationListing>(
        `${ALERT_CONFIGURATIONS_ENDPOINT}/${id}`
      );

      return {
        data: resolveItem(response),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAlertConfiguration(data: AlertConfigurationForm): Promise<ServiceResponse<AlertConfigurationListing>> {
    try {
      const response = await this.post<ApiResponse<AlertConfigurationListing>>(
        ALERT_CONFIGURATIONS_ENDPOINT,
        toCreatePayload(data)
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

  async updateAlertConfiguration(id: AlertConfigurationId, data: AlertConfigurationForm): Promise<ServiceResponse<AlertConfigurationListing>> {
    try {
      const response = await this.put<ApiResponse<AlertConfigurationListing> | AlertConfigurationListing>(
        `${ALERT_CONFIGURATIONS_ENDPOINT}/${id}`,
        toUpdatePayload(data)
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

  async executeAlertConfiguration(id: AlertConfigurationId): Promise<AlertConfigurationListing> {
    try {
      const response = await this.post<ApiResponse<AlertConfigurationListing> | AlertConfigurationListing>(
        `${ALERT_CONFIGURATIONS_ENDPOINT}/execute/${id}`,
        {}
      );

      return resolveItem(response);
    } catch (error) {
      console.error("Erro ao executar alerta:", error);
      throw this.handleError(error);
    }
  }

  async deleteAlertConfiguration(id: AlertConfigurationId): Promise<void> {
    try {
      await this.delete(`${ALERT_CONFIGURATIONS_ENDPOINT}/${id}`);
    } catch (error) {
      console.error("Erro ao eliminar alerta:", error);
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
        instance: ALERT_CONFIGURATIONS_ENDPOINT,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
