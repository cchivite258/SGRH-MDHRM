import HttpService from "@/app/http/httpService";
import type { ServiceProviderComparisonFilterType, ServiceProviderComparisonReportType } from "@/components/ammReports/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
  data: T;
  meta?: any;
}

interface ServiceResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: ApiErrorResponse;
}

export default class ServiceProviderComparisonReportService extends HttpService {
  async createReport(
    payload: ServiceProviderComparisonFilterType
  ): Promise<ServiceResponse<ServiceProviderComparisonReportType>> {
    try {
      const response = await this.post<ApiResponse<ServiceProviderComparisonReportType>>(
        "/reports/service-providers/comparison",
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
        error: this.networkErrorResponse()
      };
    }
  }

  private networkErrorResponse(): ApiErrorResponse {
    return {
      status: "error",
      message: "Network error",
      error: {
        type: "ConnectionError",
        title: "Network Error",
        status: 503,
        detail: "Could not connect to server",
        instance: "/reports/service-providers/comparison"
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}
