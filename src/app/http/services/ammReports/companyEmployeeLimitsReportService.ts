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

const CONTRACT_EMPLOYEE_LIMITS_REPORT_ENDPOINT = "/reports/contract-employee-limits";

export default class CompanyEmployeeLimitsReportService extends HttpService {
  async createReport(
    payload: CompanyEmployeeLimitsFilterType
  ): Promise<ServiceResponse<CompanyEmployeeLimitsReportType>> {
    try {
      const response = await this.post<ApiResponse<CompanyEmployeeLimitsReportType>>(
        CONTRACT_EMPLOYEE_LIMITS_REPORT_ENDPOINT,
        payload
      );
      return { status: "success", data: response.data ?? (response as unknown as CompanyEmployeeLimitsReportType) };
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
            instance: CONTRACT_EMPLOYEE_LIMITS_REPORT_ENDPOINT
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        }
      };
    }
  }
}
