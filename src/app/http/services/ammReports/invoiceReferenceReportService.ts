import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type {
  InvoiceReferenceReportFilterType,
  InvoiceReferenceReportType
} from "@/components/ammReports/types";

interface ApiResponse<T> {
  data: T;
  meta?: any;
}

interface ServiceResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: ApiErrorResponse;
}

const INVOICE_REFERENCE_REPORT_ENDPOINT = "/reports/invoice-reference";

export default class InvoiceReferenceReportService extends HttpService {
  async createReport(
    payload: InvoiceReferenceReportFilterType
  ): Promise<ServiceResponse<InvoiceReferenceReportType>> {
    try {
      const response = await this.post<ApiResponse<InvoiceReferenceReportType>>(
        INVOICE_REFERENCE_REPORT_ENDPOINT,
        payload
      );

      return {
        status: "success",
        data: response.data ?? (response as unknown as InvoiceReferenceReportType)
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: "error",
          error: error.response.data as ApiErrorResponse
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
            instance: INVOICE_REFERENCE_REPORT_ENDPOINT
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        }
      };
    }
  }
}
