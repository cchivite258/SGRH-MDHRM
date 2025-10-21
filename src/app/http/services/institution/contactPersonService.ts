// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { ContactPersonListingType, ContactPersonInsertType } from "@/components/institution/types";
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

export default class ContactPersonService extends HttpService { 
  async getContactPersonByInstitution(
    id: string | null,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: ContactPersonListingType[], meta: any }> {
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

      const queryString = queryParams.join('&');
      const url = `/administration/persons-of-contact/in-company?${queryString}`;

      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<ContactPersonListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };
      
    } catch (error) {
      console.error("❌ Erro ao buscar pessoas de contacto:", error);
      throw error;
    }
  }

   async createContactPerson(contactPersonData: ContactPersonInsertType): Promise<ServiceResponse<ContactPersonListingType>> {
      try {
        const response = await this.post<ApiResponse<ContactPersonListingType>>('/administration/persons-of-contact', contactPersonData);
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
          instance: '/administration/companies'
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      };
    }

     async getContactPersonById(id: string): Promise<{ data: ContactPersonListingType }> {
        try {
          const response = await this.get<{ data: ContactPersonListingType; meta: any }>(
            `/administration/persons-of-contact/${id}?includes=company`
          );
          console.log('Resposta da requisição getContactPersonById:------------------------', response); 
      
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

      async deleteContactPerson(id: string): Promise<void> {
        try {
          await this.delete(`/administration/persons-of-contact/${id}`);
        } catch (error) {
          console.error("❌ Erro ao deletar pessoa de contacto:", error);
          throw error;
        }
      }


      async updateContactPerson(id: string, contactPersonData: ContactPersonInsertType): Promise<ContactPersonListingType> {
            try {
        
              // Corpo da requisição conforme especificado
              const payload = {
                fullname: contactPersonData.fullname,
                email: contactPersonData.email,
                phone: contactPersonData.phone,
                company: contactPersonData.company,
                enabled: contactPersonData.enabled
              };
        
              const response = await this.put<ContactPersonListingType>(`/administration/persons-of-contact/${id}`, payload);
              console.log('response update institution', response)
              return response;
        
            } catch (error) {
              console.error("❌ Erro ao actualizar instituicao:", error);
              throw error;
            }
          }


}


