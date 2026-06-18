import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type {
  EmployeeFrequencyTrendFilterType,
  EmployeeFrequencyTrendReportType
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

const EMPLOYEE_FREQUENCY_TREND_REPORT_ENDPOINT = "/reports/trend-limits/employee-frequency";

export default class EmployeeFrequencyTrendReportService extends HttpService {
  async createReport(
    payload: EmployeeFrequencyTrendFilterType
  ): Promise<ServiceResponse<EmployeeFrequencyTrendReportType>> {
    try {
      const response = await this.post<ApiResponse<EmployeeFrequencyTrendReportType>>(
        EMPLOYEE_FREQUENCY_TREND_REPORT_ENDPOINT,
        payload
      );

      return {
        status: "success",
        data: response.data ?? (response as unknown as EmployeeFrequencyTrendReportType)
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
            instance: EMPLOYEE_FREQUENCY_TREND_REPORT_ENDPOINT
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        }
      };
    }
  }
}
