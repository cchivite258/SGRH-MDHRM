import HttpService from "@/app/http/httpService";
import type {
  PaymentOrderPeriodForm,
  PaymentOrderPeriodHistory,
  PaymentOrderPeriodId,
  PaymentOrderPeriodListing,
} from "@/components/paymentOrderPeriod/types";
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

export type RefundDeductionUnprocessPayload = {
  reasonId: number;
  notes?: string;
};

export type RefundDeductionReopenPayload = {
  reasonId: number;
  notes: string;
};

const ENDPOINT = "/amm/refund-deduction-periods";
const LIST_INCLUDES = "contract";
const DETAIL_INCLUDES = "contract";

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

const toPayload = (data: PaymentOrderPeriodForm) => {
  const payload: Record<string, any> = {
    contractId: Number(data.contractId),
    year: Number(data.year),
    month: Number(data.month),
  };

  const notes = data.notes?.trim();
  if (notes) payload.notes = notes;

  return payload;
};

export default class RefundDeductionPeriodService extends HttpService {
  async getPaymentOrderPeriods(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "createdAt",
    direction: string = "desc",
    query_value?: string,
    query_props?: string
  ): Promise<{ content: PaymentOrderPeriodListing[]; meta: any }> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sortColumn,
        direction,
        includes: LIST_INCLUDES,
      });

      if (query_value && query_props) {
        params.append("query_props", query_props);
        params.append("query_value", query_value);
      }

      const response = await this.get<ApiResponse<PaymentOrderPeriodListing[]> | PaymentOrderPeriodListing[]>(
        `${ENDPOINT}?${params.toString()}`
      );
      const content = getContent<PaymentOrderPeriodListing>(response);

      return {
        content,
        meta: getMeta(response, content.length),
      };
    } catch (error) {
      console.error("Erro ao buscar períodos de reembolsos e descontos:", error);
      throw this.handleError(error);
    }
  }

  async getPaymentOrderPeriodById(id: PaymentOrderPeriodId): Promise<{ data: PaymentOrderPeriodListing }> {
    try {
      const response = await this.get<ApiResponse<PaymentOrderPeriodListing> | PaymentOrderPeriodListing>(
        `${ENDPOINT}/${id}?includes=${DETAIL_INCLUDES}`
      );

      return {
        data: resolveItem(response),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPaymentOrderPeriod(data: PaymentOrderPeriodForm): Promise<ServiceResponse<PaymentOrderPeriodListing>> {
    try {
      const response = await this.post<ApiResponse<PaymentOrderPeriodListing>>(ENDPOINT, toPayload(data));

      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, ENDPOINT);
    }
  }

  async deletePaymentOrderPeriod(id: PaymentOrderPeriodId): Promise<void> {
    try {
      await this.delete(`${ENDPOINT}/${id}`);
    } catch (error) {
      console.error("Erro ao eliminar lote de reembolsos e descontos:", error);
      throw this.handleError(error);
    }
  }

  async generatePaymentOrderPeriod(id: PaymentOrderPeriodId): Promise<ServiceResponse<PaymentOrderPeriodListing>> {
    return this.runAction(id, "generate", () =>
      this.post<ApiResponse<PaymentOrderPeriodListing> | PaymentOrderPeriodListing>(`${ENDPOINT}/${id}/generate`, {})
    );
  }

  async submitPaymentOrderPeriod(id: PaymentOrderPeriodId): Promise<ServiceResponse<PaymentOrderPeriodListing>> {
    return this.runStatusAction(id, "submit");
  }

  async reopenPaymentOrderPeriod(
    id: PaymentOrderPeriodId,
    payload: RefundDeductionReopenPayload
  ): Promise<ServiceResponse<PaymentOrderPeriodListing>> {
    return this.runAction(id, "reopen", () =>
      this.put<ApiResponse<PaymentOrderPeriodListing> | PaymentOrderPeriodListing>(
        `${ENDPOINT}/${id}/reopen`,
        payload
      )
    );
  }

  async processPaymentOrderPeriod(id: PaymentOrderPeriodId): Promise<ServiceResponse<PaymentOrderPeriodListing>> {
    return this.runStatusAction(id, "process");
  }

  async unprocessPaymentOrderPeriod(
    id: PaymentOrderPeriodId,
    payload: RefundDeductionUnprocessPayload
  ): Promise<ServiceResponse<PaymentOrderPeriodListing>> {
    return this.runAction(id, "unprocess", () =>
      this.put<ApiResponse<PaymentOrderPeriodListing> | PaymentOrderPeriodListing>(
        `${ENDPOINT}/${id}/unprocess`,
        payload
      )
    );
  }

  async getPaymentOrderPeriodHistory(id: PaymentOrderPeriodId): Promise<PaymentOrderPeriodHistory[]> {
    try {
      const response = await this.get<ApiResponse<PaymentOrderPeriodHistory[]> | PaymentOrderPeriodHistory[]>(
        `${ENDPOINT}/${id}/history`
      );
      return getContent<PaymentOrderPeriodHistory>(response);
    } catch (error) {
      console.error("Erro ao buscar histórico do lote de reembolsos e descontos:", error);
      throw this.handleError(error);
    }
  }

  private runStatusAction(id: PaymentOrderPeriodId, action: "submit" | "process") {
    return this.runAction(id, action, () =>
      this.put<ApiResponse<PaymentOrderPeriodListing> | PaymentOrderPeriodListing>(`${ENDPOINT}/${id}/${action}`)
    );
  }

  private async runAction(
    id: PaymentOrderPeriodId,
    action: string,
    request: () => Promise<ApiResponse<PaymentOrderPeriodListing> | PaymentOrderPeriodListing>
  ): Promise<ServiceResponse<PaymentOrderPeriodListing>> {
    try {
      const response = await request();
      return {
        status: "success",
        data: resolveItem(response),
      };
    } catch (error: any) {
      return toServiceError(error, `${ENDPOINT}/${id}/${action}`);
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
