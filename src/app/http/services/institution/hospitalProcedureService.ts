// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { HospitalProcedureListingType, HospitalProcedureInsertType } from "@/components/institution/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import EnableAccountConfirmationDialog from "@/components/users/users/EnableAccountConfirmationDialog.vue";

interface ApiResponse<T> {
  data: T;
  meta?: any;
}

interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}

export default class HospitalProcedureService extends HttpService {
  async getHospitalProcedureByInstitution(
    id: string | null,
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureListingType[], meta: any }> {
    try {
      const queryParams = [
        `id=${id}`,
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      if (query_value && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      const includesToUse = 'company,hospitalProcedureType';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/administration/company/allowed-hospital-procedures/in-company?${queryString}`;

      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<HospitalProcedureListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar procedimentos hospitalares:", error);
      throw error;
    }
  }


  async getHospitalProcedureByInstitutionForDropdown(
    id: string | null,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureListingType[], meta: any }> {
    try {
      const queryParams = [
        `id=${id}`,
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      if (query_value && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      const includesToUse = 'company,hospitalProcedureType';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/administration/company/allowed-hospital-procedures/in-company?${queryString}`;

      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<HospitalProcedureListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar procedimentos hospitalares:", error);
      throw error;
    }
  }

  async getHospitalProcedureByHealthPlan(
    id: string | null,
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureListingType[], meta: any }> {
    try {
      const queryParams = [
        `id=${id}`,
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`
      ];

      if (query_value && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      const includesToUse = 'company,hospitalProcedureType';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/administration/company/allowed-hospital-procedures/in-health-plan?${queryString}`; 

      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<HospitalProcedureListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar procedimentos hospitalares:", error);
      throw error;
    }
  }

  async getHospitalProcedures(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: HospitalProcedureListingType[], meta: any }> {
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

      const includesToUse = 'company,hospitalProcedureType';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/administration/company/allowed-hospital-procedures`; 

      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<HospitalProcedureListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar procedimentos hospitalares:", error);
      throw error;
    }
  }


  async createHospitalProcedure(hospitalProcedureData: HospitalProcedureInsertType): Promise<ServiceResponse<HospitalProcedureListingType>> {
    try {
      const response = await this.post<ApiResponse<HospitalProcedureListingType>>('/administration/company/allowed-hospital-procedures', hospitalProcedureData);
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: 'error',
          error: error.response.data as ApiErrorResponse
        };
      }
      return {
        status: 'error',
        error: this.NetworkErrorResponse()
      };
    }
  }

  private NetworkErrorResponse(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: 'administration/company/allowed-hospital-procedures'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async getHospitalProcedureById(id: string): Promise<{ data: HospitalProcedureListingType }> {
    try {
      const response = await this.get<{ data: HospitalProcedureListingType; meta: any }>(
        `/administration/company/allowed-hospital-procedures/${id}?includes=company`
      );
      console.log('Resposta da requisição getHospitalProcedureById:------------------------', response);

      return {
        data: response.data
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }


  handleError(error: any) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Erro na requisição',
        details: error.response.data?.errors || null,
        status: error.response.status
      };
    }
    return {
      message: 'Erro de conexão',
      details: null
    };
  }

  async deleteHospitalProcedure(id: string): Promise<void> {
    try {
      await this.delete(`/administration/company/allowed-hospital-procedures/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar procedimento hospitalar:", error);
      throw error;
    }
  }


  async updateHospitalProcedure(id: string, hospitalProcedureData: HospitalProcedureInsertType): Promise<ServiceResponse<HospitalProcedureListingType>> {
    try {

      // Corpo da requisição conforme especificado
      const payload = {
        fixedAmount: hospitalProcedureData.fixedAmount,
        percentage: hospitalProcedureData.percentage,
        limitTypeDefinition: hospitalProcedureData.limitTypeDefinition,
        //hospitalProcedureType: hospitalProcedureData.hospitalProcedureType,
        companyHealthPlan: hospitalProcedureData.companyHealthPlan,
        enabled: hospitalProcedureData.enabled
      };

      const response = await this.put<ApiResponse<HospitalProcedureListingType>>(`/administration/company/allowed-hospital-procedures/${id}`, payload);
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: 'error',
          error: {
            ...error.response.data,
            statusCode: error.response.status
          } as ApiErrorResponse
        };
      }
      return {
        status: 'error',
        error: this.NetworkErrorResponse()
      };
    }
  }




}


