import HttpService from "@/app/http/httpService";
import type {
  HospitalProcedureGroupInsert,
  HospitalProcedureGroupListing,
  HospitalProcedureGroupUpdate,
  HospitalProcedureGroupResponse
} from "@/components/baseTables/hospitalProcedureGroup/types";
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

export default class HospitalProcedureGroupService extends HttpService {
  async getHospitalProcedureGroupById(id: string): Promise<{ data: HospitalProcedureGroupResponse }> {
    try {
      const response = await this.get<{ data: HospitalProcedureGroupResponse; meta: any }>(`/administration/setup/hospital-procedure-group/${id}`);
      return {
        data: response.data
      };
    } catch (error) {
      console.error("âŒ Erro ao buscar hospital-procedure-group por ID:", error);
      throw this.handleError(error);
    }
  }

  async getHospitalProcedureGroups(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureGroupListing[], meta: any }> {
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
      const url = `/administration/setup/hospital-procedure-group?${queryString}`;

      const response = await this.get<ApiResponse<HospitalProcedureGroupListing[]>>(url);
      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("❌ Erro ao buscar hospital-procedure-group:", error);
      throw this.handleError(error);
    }
  }

  async getHospitalProcedureGroupsForList(
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureGroupListing[], meta: any }> {
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
      const url = `/administration/setup/hospital-procedure-group?${queryString}`;

      const response = await this.get<ApiResponse<HospitalProcedureGroupListing[]>>(url);
      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("❌ Erro ao buscar hospital-procedure-group:", error);
      throw this.handleError(error);
    }
  }

  async createHospitalProcedureGroup(data: HospitalProcedureGroupInsert): Promise<ServiceResponse<HospitalProcedureGroupResponse>> {
    try {
      const response = await this.post<ApiResponse<HospitalProcedureGroupResponse>>(
        "/administration/setup/hospital-procedure-group",
        data
      );
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      console.error("❌ Erro ao criar hospital-procedure-group:", error);
      throw error;
    }
  }

  async updateHospitalProcedureGroup(id: string, data: HospitalProcedureGroupUpdate): Promise<HospitalProcedureGroupResponse> {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        enabled: data.enabled
      };
      console.log("payload hospitalprocedure", payload)

      const response = await this.put<HospitalProcedureGroupResponse>(`/administration/setup/hospital-procedure-group/${id}`, payload);
      return response;
    } catch (error) {
      console.error("❌ Erro ao actualizar hospital-procedure-group:", error);
      throw this.handleError(error);
    }
  }

  async deleteHospitalProcedureGroup(id: string): Promise<void> {
    try {
      await this.delete(`/administration/setup/hospital-procedure-group/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar hospital-procedure-group:", error);
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

  private createNetworkErrorResponseHospitalProcedureGroup(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/setup/hospital-procedure-group'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}


