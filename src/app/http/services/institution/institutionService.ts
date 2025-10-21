import HttpService from "@/app/http/httpService";
import type { InstitutionListingType, InstitutionInsertType, InstitutionResponseType } from "@/components/institution/types";
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
export default class InstitutionService extends HttpService {

  //get de todas instituicoes para o select box
  async getInstitutions(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc', // Valor padrão alterado para 'asc' conforme seu exemplo
    globalSearch?: string,
    advancedFilters: {
      prop: string;
      operator: string;
      value: string | boolean | Date;
    }[] = [],
    logicalOperator: string = 'AND'
  ): Promise<{ content: InstitutionListingType[], meta: any }> {
    try {
      // Construção manual da query string para controle total
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortColumn,
        direction
      });

      //filtro geral
      if (globalSearch) {
        params.append('query_props', 'name,address,description,phone,email,website,incomeTaxNumber,createdAt');
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

      const includesToUse = 'institutionType';
      params.append(`includes`, includesToUse);

      const url = `/administration/companies?${params.toString()}`;

      console.log('URL de busca de instituicoes:', url); // Log da URL para depuração

      const response = await this.get<ApiResponse<InstitutionListingType[]>>(url);

      console.log('Resposta da requisição:', response); // Para debug

       return {
        content: response.data || [],
        meta: response.meta || {
          totalElements: 0,
          page: 0,
          size: 10,
          totalPages: 0
        }};

    } catch (error) {
      console.error("❌ Erro ao buscar colaboradores:", error);
      throw error;
    }
  }

  //get de todas instituicoes para o select box
  async getInstitutionsForListing(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc', // Valor padrão alterado para 'asc' conforme seu exemplo
    query_value?: string,
    query_props?: string
  ): Promise<{ content: InstitutionListingType[], meta: any }> {
    try {
      // Construção manual da query string para controle total
      const queryParams = [
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`, // Apenas o nome da coluna
        `direction=${direction}`    // Direção separada
      ];

      if (query_value && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      const includesToUse = 'institutionType';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/administration/companies?${queryString}`;

      console.log('URL da requisição:', url); // Para debug

      const response = await this.get<ApiResponse<InstitutionListingType[]>>(url);

      console.log('Resposta da requisição:', response); // Para debug

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar instituicoes:", error);
      throw error;
    }
  }

  async createInstitution(institutionData: InstitutionInsertType): Promise<ServiceResponse<InstitutionResponseType>> {
    try {
      const response = await this.post<ApiResponse<InstitutionResponseType>>('/administration/companies', institutionData);
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

  private createNetworkErrorResponse(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/companies'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async getInstitutionById(id: string): Promise<{ data: InstitutionResponseType }> {
    try {
      const response = await this.get<{ data: InstitutionResponseType; meta: any }>(
        `/administration/companies/${id}?includes=institutionType`
      );
      console.log('Resposta da requisição:------------------------', response); 
  
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

  async deleteInstitution(id: string): Promise<void> {
    try {
      await this.delete(`/administration/companies/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar instituicao:", error);
      throw error;
    }
  }

   async updateInstitution(id: string, institutionData: InstitutionInsertType): Promise<InstitutionResponseType> {
      try {
  
        // Corpo da requisição conforme especificado
        const payload = {
          name: institutionData.name,
          description: institutionData.description,
          address: institutionData.address,
          phone: institutionData.phone,
          email: institutionData.email,
          website: institutionData.website,
          incomeTaxNumber: institutionData.incomeTaxNumber,
          institutionType: institutionData.institutionType,
          maxNumberOfDependents: institutionData.maxNumberOfDependents,
          childrenMaxAge: institutionData.childrenMaxAge,
          healthPlanLimit: institutionData.healthPlanLimit,
          salaryComponent: institutionData.salaryComponent,
          fixedAmount: institutionData.fixedAmount,
          enabled: institutionData.enabled

        };
  
        const response = await this.put<InstitutionResponseType>(`/administration/companies/${id}`, payload);
        console.log('response update institution', response)
        return response;
  
      } catch (error) {
        console.error("❌ Erro ao actualizar instituicao:", error);
        throw error;
      }
    }



}