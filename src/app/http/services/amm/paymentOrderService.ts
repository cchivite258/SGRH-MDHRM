import HttpService from "@/app/http/httpService";
import type {
  PaymentOrderLine,
  PaymentOrderPeriodId,
} from "@/components/paymentOrderPeriod/types";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: any;
  metadata?: any;
}

const PAYMENT_ORDER_ENDPOINT = "/amm/payment-orders";
const BY_PERIOD_INCLUDES = "employee,invoice";
const BY_PERIOD_PAGE_SIZE = 5000;

const getContent = <T>(response: ApiResponse<T[]> | T[]): T[] => {
  if (Array.isArray(response)) return response;
  return response.content ?? response.data ?? [];
};

export default class PaymentOrderService extends HttpService {
  // A paginação das linhas do período é feita no front, por isso pede todas as linhas num único pedido.
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
      console.error("Erro ao buscar linhas do período:", error);
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
