// services/departmentService.ts
import HttpService from "@/app/http/httpService";
import type {
  DependentListingType,
  DependentInsertType,
  DependentAttachmentType,
  DependentDocumentType
} from "@/components/employee/types";
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

export default class DependentEmployeeService extends HttpService { 
  private createNetworkErrorResponse(instance: string = '/human-resource/employees-dependents'): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async getDependentbyEmployee(
    id: string | null,
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: DependentListingType[], meta: any }> {
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

      const includesToUse = 'company';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/human-resource/employees-dependents/of-employee?${queryString}`;


      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<DependentListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar dependentes:", error);
      throw error;
    }
  }

  async getDependentbyEmployeeForDropdown(
    id: string | null,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: DependentListingType[], meta: any }> {
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

      const includesToUse = 'company';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');
      const url = `/human-resource/employees-dependents/of-employee?${queryString}`;


      console.log('URL da requisição:', url);
      const response = await this.get<ApiResponse<DependentListingType[]>>(url);

      return {
        content: response.data || [],
        meta: response.meta || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar dependentes:", error);
      throw error;
    }
  }

  async createDependent(dependentData: DependentInsertType): Promise<ServiceResponse<DependentListingType>> {
    try {
      const payload = {
        firstName: dependentData.firstName,
        middleName: dependentData.middleName,
        lastName: dependentData.lastName,
        gender: dependentData.gender,
        birthDate: dependentData.birthDate,
        relationship: dependentData.relationship,
        isUnivesityStudent: dependentData.isUnivesityStudent,
        employee: dependentData.employee,
        idCardNumber: dependentData.idCardNumber,
        idCardIssuer: dependentData.idCardIssuer,
        idCardIssuanceDate: dependentData.idCardIssuanceDate,
        idCardExpiryDate: dependentData.idCardExpiryDate,
        isLifeTimeCard: dependentData.isLifeTimeCard,
        enabled: dependentData.enabled
      };

      const response = await this.post<ApiResponse<DependentListingType>>('/human-resource/employees-dependents', payload);
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
    return this.createNetworkErrorResponse();
  }

  async getDependentById(id: string): Promise<{ data: DependentListingType }> {
    try {
      const response = await this.get<{ data: DependentListingType; meta: any }>(
        `/human-resource/employees-dependents/${id}?includes=company`
      );
      console.log('Resposta da requisição getDependentById:------------------------', response);

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

  async deleteDependent(id: string): Promise<void> {
    try {
      await this.delete(`/human-resource/employees-dependents/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar dependente:", error);
      throw error;
    }
  }


  async updateDependent(id: string, dependentData: DependentInsertType): Promise<ServiceResponse<DependentListingType>> {

    try {
      console.log("payload dependet", dependentData)
      // Corpo da requisição conforme especificado
      const payload = {
        firstName: dependentData.firstName,
        middleName: dependentData.middleName,
        lastName: dependentData.lastName,
        gender: dependentData.gender,
        birthDate: dependentData.birthDate,
        relationship: dependentData.relationship,
        isUnivesityStudent: dependentData.isUnivesityStudent,
        employee: dependentData.employee,
        idCardNumber: dependentData.idCardNumber,
        idCardIssuer: dependentData.idCardIssuer,
        isLifeTimeCard: dependentData.isLifeTimeCard,
        idCardIssuanceDate: dependentData.idCardIssuanceDate,
        idCardExpiryDate: dependentData.idCardExpiryDate,
        enabled: dependentData.enabled
      };

      const response = await this.put<ApiResponse<DependentListingType>>(`/human-resource/employees-dependents/${id}`, payload);
      console.log('response update dependent', response)
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

  async uploadAttachment(
    dependentId: string,
    file: File,
    dependentDocumentType: DependentDocumentType = 'STUDENT_CERTIFICATE'
  ): Promise<ServiceResponse<DependentAttachmentType>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dependentDocumentType', dependentDocumentType);

      const response = await this.putFile<ApiResponse<DependentAttachmentType>>(
        `/human-resource/employees-dependents/attachments/${dependentId}/attach-file`,
        formData
      );

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
        error: this.createNetworkErrorResponse('/human-resource/employees-dependents/attachments')
      };
    }
  }

  async getAttachmentsByDependent(dependentId: string): Promise<ServiceResponse<DependentAttachmentType[]>> {
    try {
      const response = await this.get<ApiResponse<DependentAttachmentType[]>>(
        `/human-resource/employees-dependents/attachments/by-dependent/${dependentId}`
      );

      return {
        status: 'success',
        data: response.data || []
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
        error: this.createNetworkErrorResponse('/human-resource/employees-dependents/attachments/by-dependent')
      };
    }
  }

  async getAttachmentById(id: string): Promise<ServiceResponse<DependentAttachmentType>> {
    try {
      const response = await this.get<ApiResponse<DependentAttachmentType>>(
        `/human-resource/employees-dependents/attachments/${id}`
      );

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
        error: this.createNetworkErrorResponse('/human-resource/employees-dependents/attachments')
      };
    }
  }

  async deleteAttachment(id: string): Promise<ServiceResponse<void>> {
    try {
      await this.delete(`/human-resource/employees-dependents/attachments/${id}`);

      return {
        status: 'success',
        data: undefined
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
        error: this.createNetworkErrorResponse('/human-resource/employees-dependents/attachments')
      };
    }
  }

  async downloadAttachment(id: string, name: string, extension: string): Promise<ServiceResponse<void>> {
    try {
      const blob = await this.downloadFile(
        `/human-resource/employees-dependents/attachments/${id}/download-file`
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = extension && !name.endsWith(`.${extension}`) ? `${name}.${extension}` : name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { status: "success", data: undefined };
    } catch (error: any) {
      if (error.response) {
        return {
          status: "error",
          error: error.response.data as ApiErrorResponse,
        };
      }
      return {
        status: "error",
        error: this.createNetworkErrorResponse('/human-resource/employees-dependents/attachments')
      };
    }
  }


}
