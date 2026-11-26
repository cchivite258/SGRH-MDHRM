import HttpService from "@/app/http/httpService";
import type {
  PaymentOrderLine,
  PaymentOrderPeriodId,
  PaymentOrderSettleItem,
} from "@/components/paymentOrderPeriod/types";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: any;
  metadata?: any;
}

const ENDPOINT = "/amm/refund-deduction-orders";
const BY_PERIOD_INCLUDES = "employee,details";
const BY_PERIOD_PAGE_SIZE = 5000;

const getContent = <T>(response: ApiResponse<T[]> | T[]): T[] => {
  if (Array.isArray(response)) return response;
  return response.content ?? response.data ?? [];
};

const resolveItem = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === "object" && ("data" in response || "content" in response)) {
    const wrapped = response as ApiResponse<T>;
    return (wrapped.data ?? wrapped.content) as T;
  }

  return response as T;
};

export default class RefundDeductionOrderService extends HttpService {
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
        `${ENDPOINT}/by-period/${periodId}?${params.toString()}`
      );

      return getContent<PaymentOrderLine>(response);
    } catch (error) {
      console.error("Erro ao buscar ordens de reembolsos e descontos do período:", error);
      throw this.handleError(error);
    }
  }

  async bulkUpdateByPeriod(
    periodId: PaymentOrderPeriodId,
    items: PaymentOrderSettleItem[]
  ): Promise<PaymentOrderLine[]> {
    try {
      const response = await this.put<ApiResponse<PaymentOrderLine[]> | PaymentOrderLine[]>(
        `${ENDPOINT}/by-period/${periodId}`,
        { items }
      );

      return getContent<PaymentOrderLine>(response);
    } catch (error) {
      console.error("Erro ao actualizar ordens de reembolsos e descontos:", error);
      throw this.handleError(error);
    }
  }

  async updateOrder(id: string, payload: { amountSettled: number; notes?: string }): Promise<PaymentOrderLine> {
    try {
      const response = await this.put<ApiResponse<PaymentOrderLine> | PaymentOrderLine>(
        `${ENDPOINT}/${id}`,
        payload
      );
      return resolveItem(response);
    } catch (error) {
      console.error("Erro ao actualizar ordem de reembolso/desconto:", error);
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
