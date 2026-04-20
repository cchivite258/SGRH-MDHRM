// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type { ContactPersonListingType, ContactPersonInsertType } from "@/components/institution/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: any;
  metadata?: any;
}

interface ServiceResponse<T> {  
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}

const CONTACT_PERSON_ENDPOINT = '/administration/persons-of-contact';
const CONTACT_PERSON_BY_CONTRACT_ENDPOINT = `${CONTACT_PERSON_ENDPOINT}/in-contract`;

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta ?? [];

const toContactPersonPayload = (contactPersonData: ContactPersonInsertType) => ({
  fullname: contactPersonData.fullname,
  email: contactPersonData.email,
  phone: contactPersonData.phone,
  contract: contactPersonData.company,
  enabled: contactPersonData.enabled
});

const normalizeContactPerson = <T extends Record<string, any>>(item: T): T => ({
  ...item,
  company: item.company ?? item.contract
});

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
      const url = `${CONTACT_PERSON_BY_CONTRACT_ENDPOINT}?${queryString}`;

      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<ContactPersonListingType[]>>(url);

      return {
        content: getContent(response).map((item: any) => normalizeContactPerson(item)) as ContactPersonListingType[],
        meta: getMeta(response)
      };
      
    } catch (error) {
      console.error("❌ Erro ao buscar pessoas de contacto:", error);
      throw error;
    }
  }

   async createContactPerson(contactPersonData: ContactPersonInsertType): Promise<ServiceResponse<ContactPersonListingType>> {
      try {
        const response = await this.post<ApiResponse<ContactPersonListingType>>(CONTACT_PERSON_ENDPOINT, toContactPersonPayload(contactPersonData));
        return {
          status: 'success',
          data: normalizeContactPerson((response.data ?? response.content ?? response) as any) as ContactPersonListingType
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
          instance: CONTACT_PERSON_ENDPOINT
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      };
    }

     async getContactPersonById(id: string): Promise<{ data: ContactPersonListingType }> {
        try {
          const response = await this.get<{ data: ContactPersonListingType; meta: any }>(
            `${CONTACT_PERSON_ENDPOINT}/${id}?includes=contract`
          );
          console.log('Resposta da requisição getContactPersonById:------------------------', response); 
      
          return {
            data: normalizeContactPerson(((response as any).data ?? response) as any) as ContactPersonListingType
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
          await this.delete(`${CONTACT_PERSON_ENDPOINT}/${id}`);
        } catch (error) {
          console.error("❌ Erro ao deletar pessoa de contacto:", error);
          throw error;
        }
      }


      async updateContactPerson(id: string, contactPersonData: ContactPersonInsertType): Promise<ContactPersonListingType> {
            try {
        
              // Corpo da requisição conforme especificado
              const payload = toContactPersonPayload(contactPersonData);
        
              const response = await this.put<ContactPersonListingType>(`${CONTACT_PERSON_ENDPOINT}/${id}`, payload);
              console.log('response update institution', response)
              return normalizeContactPerson(response as any) as ContactPersonListingType;
        
            } catch (error) {
              console.error("❌ Erro ao actualizar instituicao:", error);
              throw error;
            }
          }


}
