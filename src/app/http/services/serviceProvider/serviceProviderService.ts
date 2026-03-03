import HttpService from "@/app/http/httpService";
import type { ServiceProviderListingType, ServiceProviderInsertType, ServiceProviderResponseType } from "@/components/serviceProvider/types";
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

export default class ServiceProviderService extends HttpService { 

  // Obter todos os prestadores de serviços
  async getServiceProviders(
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
  ): Promise<{ content: ServiceProviderListingType[], meta: any }> {
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

      const includesToUse = 'providerTypes';
      params.append(`includes`, includesToUse);

      const url = `/administration/service-provider?${params.toString()}`;
      console.log("🔍 Obtendo provedores de serviço com URL:", url);
      
      const response = await this.get<ApiResponse<ServiceProviderListingType[]>>(url);
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

  // Obter prestadores de serviços para o dropdown
  async getServiceProvidersForDropdown(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string,
    
  ): Promise<{ content: ServiceProviderListingType[], meta: any }> {
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
      //por alterar
      const url = `/administration/service-provider?${queryString}`;
      console.log("🔍 Obtendo clínicas com URL:", url);

      const response = await this.get<ApiResponse<ServiceProviderListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };
    } catch (error) {
      console.error("❌ Erro ao buscar clínicas:", error);
      throw error;
    }
  }

  // Criar novo prestador de serviços
  async createServiceProvider(serviceProviderData: ServiceProviderInsertType): Promise<ServiceResponse<ServiceProviderResponseType>> {
    try {
      //const response = await this.post<ApiResponse<ServiceProviderResponseType>>('/administration/service-providers', serviceProviderData);
      const response = await this.post<ApiResponse<ServiceProviderResponseType>>('/administration/service-provider', serviceProviderData);
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

  // Obter prestador de serviços por ID
  async getServiceProviderById(id: string): Promise<{ data: ServiceProviderResponseType }> {
    try {
      //const response = await this.get<{ data: ServiceProviderResponseType; meta: any }>(`/administration/service-providers/${id}`);
      
      const response = await this.get<{ data: ServiceProviderResponseType; meta: any }>(`/administration/service-provider/${id}?includes=providerTypes`);
      return { data: response.data };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Atualizar prestador de serviços
  async updateServiceProvider(id: string, serviceProviderData: ServiceProviderInsertType): Promise<ServiceResponse<ServiceProviderResponseType>> { 
    try {
      //const response = await this.put<ServiceProviderResponseType>(`/administration/service-providers/${id}`, serviceProviderData);
      const response = await this.put<ServiceResponse<ServiceProviderResponseType>>(`/administration/service-provider/${id}`, serviceProviderData);
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

  // Eliminar prestador de serviços
  async deleteServiceProvider(id: string): Promise<void> {
    try {
      //await this.delete(`/administration/service-providers/${id}`);
      await this.delete(`/administration/service-provider/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar prestador de serviços:", error);
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
        instance: '/administration/service-providers'},
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
