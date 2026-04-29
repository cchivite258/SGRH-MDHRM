import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type {
  EmployeeExpenseStatementFilterType,
  EmployeeExpenseStatementReportType,
} from "@/components/ammReports/types";

interface ApiResponse<T> {
  status?: string;
  data?: T;
  meta?: any;
}

interface ServiceResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: ApiErrorResponse;
}

export default class EmployeeExpenseStatementReportService extends HttpService {
  async createReport(
    payload: EmployeeExpenseStatementFilterType
  ): Promise<ServiceResponse<EmployeeExpenseStatementReportType>> {
    try {
      const response = await this.post<ApiResponse<EmployeeExpenseStatementReportType>>(
        "/reports/employee-expenses",
        payload
      );

      //console.log("EmployeeExpenseStatementReportType:", response);

      if (response?.status && response.status !== "success") {
        return {
          status: "error",
          error: {
            status: "error",
            message: "Unexpected response status",
            error: {
              type: "BusinessError",
              title: "Request Error",
              status: 400,
              detail: "Could not generate employee expense report",
              instance: "/reports/employee-expenses",
            },
            meta: {
              timestamp: new Date().toISOString(),
            },
          },
        };
      }

      return { status: "success", data: response?.data };
    } catch (error: any) {
      if (error.response) {
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
            instance: "/reports/employee-expenses",
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
      };
    }
  }

  async sendNotificationByEmployee(
    employeeId: string
  ): Promise<ServiceResponse<void>> {
    try {
      const response = await this.get<ApiResponse<void>>(
        `/reports/employee-extract-notification/by-employee/${employeeId}`
      );

      if (response?.status && response.status !== "success") {
        return {
          status: "error",
          error: {
            status: "error",
            message: "Unexpected response status",
            error: {
              type: "BusinessError",
              title: "Request Error",
              status: 400,
              detail: "Could not send employee extract notification",
              instance: `/reports/employee-extract-notification/by-employee/${employeeId}`,
            },
            meta: {
              timestamp: new Date().toISOString(),
            },
          },
        };
      }

      return { status: "success" };
    } catch (error: any) {
      if (error.response) {
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
            instance: `/reports/employee-extract-notification/by-employee/${employeeId}`,
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
      };
    }
  }
}
