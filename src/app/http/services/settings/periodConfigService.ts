import HttpService from "@/app/http/httpService";
import type {
  PeriodConfigForm,
  PeriodConfigId,
  PeriodConfigListing,
  PeriodConfigType,
  ResolvedPeriod,
} from "@/components/settings/periodConfig/types";
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

const PERIOD_CONFIG_ENDPOINT = "/administration/setup/period-config";

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

const toPayload = (data: PeriodConfigForm) => {
  const payload: Record<string, any> = {
    type: data.type,
    description: data.description?.trim() ?? "",
    startDayOfMonth: data.startDayOfMonth,
    startMonthReference: data.startMonthReference,
    endMonthReference: data.endMonthReference,
    endDayLastDayOfMonth: data.endDayLastDayOfMonth,
  };

  payload.endDayOfMonth = data.endDayLastDayOfMonth ? null : data.endDayOfMonth;

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

export default class PeriodConfigService extends HttpService {
  async getPeriodConfigs(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "createdAt",
    direction: string = "asc",
    query_value?: string,
    query_props?: string
  ): Promise<{ content: PeriodConfigListing[]; meta: any }> {
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

      const response = await this.get<ApiResponse<PeriodConfigListing[]> | PeriodConfigListing[]>(
        `${PERIOD_CONFIG_ENDPOINT}?${params.toString()}`
      );
      const content = getContent<PeriodConfigListing>(response);

      return {
        content,
        meta: getMeta(response, content.length),
      };
    } catch (error) {
      console.error("Erro ao buscar configuracoes de periodos:", error);
      throw this.handleError(error);
    }
  }

  async getPeriodConfigById(id: PeriodConfigId): Promise<{ data: PeriodConfigListing }> {
    try {
      const response = await this.get<ApiResponse<PeriodConfigListing> | PeriodConfigListing>(
        `${PERIOD_CONFIG_ENDPOINT}/${id}`
      );

      return {
        data: resolveItem(response),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPeriodConfig(data: PeriodConfigForm): Promise<ServiceResponse<PeriodConfigListing>> {
    try {
      const response = await this.post<ApiResponse<PeriodConfigListing>>(PERIOD_CONFIG_ENDPOINT, toPayload(data));

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, PERIOD_CONFIG_ENDPOINT);
    }
  }

  async updatePeriodConfig(id: PeriodConfigId, data: PeriodConfigForm): Promise<ServiceResponse<PeriodConfigListing>> {
    try {
      const response = await this.put<ApiResponse<PeriodConfigListing> | PeriodConfigListing>(
        `${PERIOD_CONFIG_ENDPOINT}/${id}`,
        toPayload(data)
      );

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, `${PERIOD_CONFIG_ENDPOINT}/${id}`);
    }
  }

  async deletePeriodConfig(id: PeriodConfigId): Promise<void> {
    try {
      await this.delete(`${PERIOD_CONFIG_ENDPOINT}/${id}`);
    } catch (error) {
      console.error("Erro ao eliminar configuracao de periodo:", error);
      throw this.handleError(error);
    }
  }

  async activatePeriodConfig(id: PeriodConfigId): Promise<ServiceResponse<PeriodConfigListing>> {
    try {
      const response = await this.put<ApiResponse<PeriodConfigListing> | PeriodConfigListing>(
        `${PERIOD_CONFIG_ENDPOINT}/${id}/activate`
      );

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, `${PERIOD_CONFIG_ENDPOINT}/${id}/activate`);
    }
  }

  async deactivatePeriodConfig(id: PeriodConfigId): Promise<ServiceResponse<PeriodConfigListing>> {
    try {
      const response = await this.put<ApiResponse<PeriodConfigListing> | PeriodConfigListing>(
        `${PERIOD_CONFIG_ENDPOINT}/${id}/deactivate`
      );

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, `${PERIOD_CONFIG_ENDPOINT}/${id}/deactivate`);
    }
  }

  async resolvePeriod(type: PeriodConfigType, year: number, month: number): Promise<ResolvedPeriod> {
    try {
      const params = new URLSearchParams({
        type,
        year: String(year),
        month: String(month),
      });
      const response = await this.get<ApiResponse<ResolvedPeriod> | ResolvedPeriod>(
        `${PERIOD_CONFIG_ENDPOINT}/resolve?${params.toString()}`
      );

      return resolveItem(response);
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
