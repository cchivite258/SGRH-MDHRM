import HttpService from "@/app/http/httpService";
import type {
  PaymentOrderLine,
  PaymentOrderPeriodId,
  PaymentOrderSettleItem,
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

const PAYMENT_ORDER_ENDPOINT = "/amm/payment-orders";
const BY_PERIOD_INCLUDES = "employee";
const BY_PERIOD_PAGE_SIZE = 5000;

const getContent = <T>(response: ApiResponse<T[]> | T[]): T[] => {
  if (Array.isArray(response)) return response;
  return response.content ?? response.data ?? [];
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

export default class PaymentOrderService extends HttpService {
  // A paginação das linhas do lote é feita no front, por isso pede todas as linhas num único pedido.
  async getAllByPeriod(periodId: PaymentOrderPeriodId): Promise<PaymentOrderLine[]> {
    try {
      const params = new URLSearchParams({
        page: "0",
        size: String(BY_PERIOD_PAGE_SIZE),
        sortColumn: "createdAt",
        direction: "asc",
        includes: BY_PERIOD_INCLUDES,
      });

      const response = await this.get<ApiResponse<PaymentOrderLine[]> | PaymentOrderLine[]>(
        `${PAYMENT_ORDER_ENDPOINT}/by-period/${periodId}?${params.toString()}`
      );

      return getContent<PaymentOrderLine>(response);
    } catch (error) {
      console.error("Erro ao buscar linhas do lote:", error);
      throw this.handleError(error);
    }
  }

  async bulkSettle(
    periodId: PaymentOrderPeriodId,
    items: PaymentOrderSettleItem[]
  ): Promise<ServiceResponse<PaymentOrderLine[]>> {
    const endpoint = `${PAYMENT_ORDER_ENDPOINT}/by-period/${periodId}/bulk-settle`;

    try {
      const response = await this.put<ApiResponse<PaymentOrderLine[]> | PaymentOrderLine[]>(endpoint, { items });

      return {
        status: "success",
        data: getContent<PaymentOrderLine>(response),
      };
    } catch (error: any) {
      return toServiceError(error, endpoint);
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
