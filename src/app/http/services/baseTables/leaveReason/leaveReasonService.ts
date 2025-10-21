import HttpService from "@/app/http/httpService";
import type {
  LeaveReasonInsert,
  LeaveReasonListing,
  LeaveReasonUpdate,
  LeaveReasonResponse
} from "@/components/baseTables/leaveReason/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
  data: T;
  meta?: any;
}

interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}

export default class LeaveReasonService extends HttpService {

  async getLeaveReasons(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: LeaveReasonListing[]; meta: any }> {
    try {
      const queryParams = [
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      if (query_value && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      const queryString = queryParams.join('&');
      const url = `/administration/setup/leave-reasons?${queryString}`;

      const response = await this.get<ApiResponse<LeaveReasonListing[]>>(url);
      return {
        content: response.data || [],
        meta: response.meta || {}
      };
    } catch (error) {
      console.error("❌ Erro ao buscar leave-reasons:", error);
      throw this.handleError(error);
    }
  }

  async createLeaveReason(data: LeaveReasonInsert): Promise<ServiceResponse<LeaveReasonResponse>> {
    try {
      const response = await this.post<ApiResponse<LeaveReasonResponse>>(
        "/administration/setup/leave-reasons",
        data
      );
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateLeaveReason(id: string, data: LeaveReasonUpdate): Promise<LeaveReasonResponse> {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        enabled: data.enabled
      };

      console.log("payload leave reason", payload);

      const response = await this.put<LeaveReasonResponse>(
        `/administration/setup/leave-reasons/${id}`,
        payload
      );
      return response;
    } catch (error) {
      console.error("❌ Erro ao actualizar leave-reason:", error);
      throw this.handleError(error);
    }
  }

  async deleteLeaveReason(id: string): Promise<void> {
    try {
      await this.delete(`/administration/setup/leave-reasons/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar leave-reason:", error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Erro na requisição',
        error: error.response.data?.error || null,
        status: error.response.status
      };
    }
    return {
      message: 'Erro de conexão',
      error: null,
      status: 503
    };
  }

  private createNetworkErrorResponseLeaveReason(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/setup/leave-reasons'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}
