import HttpService from "@/app/http/httpService";
import type { ClinicListingType, ClinicInsertType, ClinicResponseType } from "@/components/clinics/types";
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

export default class ClinicService extends HttpService { 

  // Obter todas as clínicas
  async getClinics(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    globalSearch?: string,
    advancedFilters: {
      prop: string;
      operator: string;
      value: string | boolean | Date;
    }[] = [],
    logicalOperator: string = 'AND'
  ): Promise<{ content: ClinicListingType[], meta: any }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortColumn,
        direction
      });

       //filtro geral
      if (globalSearch) {
        params.append('query_props', 'name,address,phone,email,description,website,incomeTaxNumber,personOfContactFullname1,personOfContactPhone1,personOfContactEmail1,personOfContactFullname2,personOfContactPhone2,personOfContactEmail2');
        params.append('query_operator', 'OR');
        params.append('query_value', globalSearch);
      }

      //filtros avançados
      if (advancedFilters.length > 0) {
        params.append('query_props', advancedFilters.map(f => f.prop).join(','));
        params.append('query_comparision', advancedFilters.map(f => f.operator).join(','));
        params.append('query_value', advancedFilters.map(f => f.value).join(','));
        params.append('query_operator', logicalOperator);
      }

      const includesToUse = '';
      params.append(`includes`, includesToUse);

      const url = `/administration/clinics?${params.toString()}`;
      console.log("🔍 Obtendo clínicas com URL:", url);
      
      const response = await this.get<ApiResponse<ClinicListingType[]>>(url);
       console.log('Resposta da requisição:', response); // Para debug

       return {
        content: response.data || [],
        meta: response.meta || {
          totalElements: 0,
          page: 0,
          size: 10,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error("❌ Erro ao buscar clínicas:", error);
      throw error;
    }
  }

  // Obter clínicas para o dropdown
  async getClinicsForDropdown(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string,
    
  ): Promise<{ content: ClinicListingType[], meta: any }> {
    try {
      const queryParams = [
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`,
      ];

      if (query_value && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      const queryString = queryParams.join('&');
      const url = `/administration/clinics?${queryString}`;
      console.log("🔍 Obtendo clínicas com URL:", url);

      const response = await this.get<ApiResponse<ClinicListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };
    } catch (error) {
      console.error("❌ Erro ao buscar clínicas:", error);
      throw error;
    }
  }

  // Criar nova clínica
  async createClinic(clinicData: ClinicInsertType): Promise<ServiceResponse<ClinicResponseType>> {
    try {
      const response = await this.post<ApiResponse<ClinicResponseType>>('/administration/clinics', clinicData);
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
        error: this.createNetworkErrorResponse()
      };
    }
  }

  // Obter clínica por ID
  async getClinicById(id: string): Promise<{ data: ClinicResponseType }> {
    try {
      const response = await this.get<{ data: ClinicResponseType; meta: any }>(`/administration/clinics/${id}`);
      return { data: response.data };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Atualizar clínica
  async updateClinic(id: string, clinicData: ClinicInsertType): Promise<ClinicResponseType> {
    try {
      const response = await this.put<ClinicResponseType>(`/administration/clinics/${id}`, clinicData);
      return response;
    } catch (error) {
      console.error("❌ Erro ao atualizar clínica:", error);
      throw error;
    }
  }

  // Eliminar clínica
  async deleteClinic(id: string): Promise<void> {
    try {
      await this.delete(`/administration/clinics/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar clínica:", error);
      throw error;
    }
  }

  private createNetworkErrorResponse(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/clinics'},
      meta: {
        timestamp: new Date().toISOString()
      }
    };
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
}
