import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type {
  CompanyEmployeeLimitsFilterType,
  CompanyEmployeeLimitsReportType
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

export default class CompanyEmployeeLimitsReportService extends HttpService {
  async createReport(
    payload: CompanyEmployeeLimitsFilterType
  ): Promise<ServiceResponse<CompanyEmployeeLimitsReportType>> {
    try {
      const response = await this.post<ApiResponse<CompanyEmployeeLimitsReportType>>(
        "/reports/company-employee-limits",
        payload
      );
      return { status: "success", data: response.data };
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
            instance: "/reports/company-employee-limits"
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        }
      };
    }
  }
}

