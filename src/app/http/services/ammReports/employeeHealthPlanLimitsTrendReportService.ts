import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type {
  EmployeeHealthPlanLimitsTrendFilterType,
  EmployeeHealthPlanLimitsTrendReportType
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

const EMPLOYEE_HEALTH_PLAN_LIMITS_TREND_ENDPOINT = "/reports/trend-limits/employee-health-plan-limits";

export default class EmployeeHealthPlanLimitsTrendReportService extends HttpService {
  async createReport(
    payload: EmployeeHealthPlanLimitsTrendFilterType
  ): Promise<ServiceResponse<EmployeeHealthPlanLimitsTrendReportType>> {
    try {
      const response = await this.post<ApiResponse<EmployeeHealthPlanLimitsTrendReportType>>(
        EMPLOYEE_HEALTH_PLAN_LIMITS_TREND_ENDPOINT,
        payload
      );

      return {
        status: "success",
        data: response.data ?? (response as unknown as EmployeeHealthPlanLimitsTrendReportType)
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
            instance: EMPLOYEE_HEALTH_PLAN_LIMITS_TREND_ENDPOINT
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        }
      };
    }
  }
}
