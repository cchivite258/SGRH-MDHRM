import HttpService from "@/app/http/httpService";
import type { InvoiceInsertType, InvoiceResponseType, InvoiceListingType, InvoiceAdviceResponseType, InvoiceAttachmentType } from "@/components/invoice/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { bi } from "@/assets/images/flags/utils";

interface ApiResponse<T> {
  data: T;
  meta?: any;
}

interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}

export default class InvoiceService extends HttpService {

  //get de todas instituicoes para o select box
  async getInvoices(
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
  ): Promise<{ content: InvoiceListingType[], meta: any }> {
    try {
      // Construção manual da query string para controle total
      // Construção manual da query string para controle total
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortColumn,
        direction
      }); 

      if (globalSearch) {
        params.append('query_props', 'invoiceNumber,issueDate,dueDate,totalAmount,invoiceStatus,employee.firstName,employee.lastName,serviceProvider.name,dependent.name,coveragePeriod.name,currency.name');
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

      const includesToUse = 'employee,serviceProvider,currency,invoiceAttachment,coveragePeriod';
      params.append(`includes`, includesToUse);

      const url = `/amm/invoices?${params.toString()}`;

      console.log('URL da requisição invoice------------------:', url); // Para debug

      const response = await this.get<ApiResponse<InvoiceListingType[]>>(url);

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
      console.error("❌ Erro ao buscar facturas:", error);
      throw error;
    }
  }

  //get de todas instituicoes para o select box
  async getInvoicesForDropdown(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc', // Valor padrão alterado para 'asc' conforme seu exemplo
    query_value?: string,
    query_props?: string
  ): Promise<{ content: InvoiceListingType[], meta: any }> {
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
      const url = `/amm/invoices?${queryString}`;

      console.log('URL da requisição:', url); // Para debug

      const response = await this.get<ApiResponse<InvoiceListingType[]>>(url);

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

  async createInvoice(invoiceData: InvoiceInsertType): Promise<ServiceResponse<InvoiceResponseType>> {
    try {
      const response = await this.post<ApiResponse<InvoiceResponseType>>('/amm/invoices', invoiceData);
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
        instance: '/amm/invoices'
      },
      meta: {
        timestamp: new Date().toISOString() 
      }
    };
  }

  async getInvoiceById(id: string): Promise<{ data: InvoiceResponseType }> {
    try {
      const response = await this.get<{ data: InvoiceResponseType; meta: any }>(
        `/amm/invoices/${id}?includes=employee,serviceProvider,currency,dependent,coveragePeriod,invoiceAttachment`
      );
      console.log('Resposta da requisição de facturas:------------------------', response);

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

  async postInvoice(id: string): Promise<{ data: InvoiceResponseType }> {
    try {
      const response = await this.put<{ data: InvoiceResponseType; meta: any }>(
        `/amm/invoices/${id}/post`
      );
      console.log('Resposta ao post da factura:------------------------', response);

      return {
        data: response.data
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async postFlaggedInvoice(id: string): Promise<{ data: InvoiceResponseType }> {
    try {
      const response = await this.put<{ data: InvoiceResponseType; meta: any }>(
        `/amm/invoices/${id}/post-flagged`
      );
      console.log('Resposta ao post flagged da factura:------------------------', response);

      return {
        data: response.data
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelInvoice(id: string): Promise<{ data: InvoiceResponseType }> {
    try {
      const response = await this.put<{ data: InvoiceResponseType; meta: any }>(
        `/amm/invoices/${id}/cancel`
      );
      console.log('Resposta ao cancel da factura:------------------------', response);

      return {
        data: response.data
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }


  async deleteInvoice(id: string): Promise<void> {
    try {
      await this.delete(`/amm/invoices/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar factura:", error);
      throw error;
    }
  }

  async updateInvoice(id: string, invoiceData: InvoiceInsertType): Promise<ServiceResponse<InvoiceResponseType>> {
    try {

      // Corpo da requisição conforme especificado
      const payload = {
        invoiceNumber: invoiceData.invoiceNumber,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        totalAmount: invoiceData.totalAmount,
        employee: invoiceData.employee,
        serviceProvider: invoiceData.serviceProvider,
        currency: invoiceData.currency,
        isEmployeeInvoice: invoiceData.isEmployeeInvoice,
        dependent: invoiceData.dependent,
        authorizedBy: invoiceData.authorizedBy,
        invoiceReferenceNumber: invoiceData.invoiceReferenceNumber
      };

      console.log("payload do update invoice: ", payload);

      const response = await this.put<ApiResponse<InvoiceResponseType>>(`/amm/invoices/${id}`, payload);
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
        instance: '/amm/invoices/',
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }


  async getAdviceInvoice(id: string, billedAmount: number): Promise<{ data: InvoiceAdviceResponseType }> {
    try {

      const response = await this.get<{ data: InvoiceAdviceResponseType; meta: any }>(
        `/amm/invoices/advice?employeeId=${id}&billedAmount=${billedAmount}`
      );
      console.log('Resposta da requisição do advice:------------------------', response);

      return {
        data: response.data
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }


  //Attachment upload
 async uploadAttachment(payload: InvoiceAttachmentType): Promise<ServiceResponse<InvoiceAttachmentType>> {
  try {
    const formData = new FormData();
    formData.append('file', payload.file as File);

    console.log("✅ FormData file appended:", formData.get('file'));

    const response = await this.putFile<ApiResponse<InvoiceAttachmentType>>(
      `/amm/invoices/${payload.id}/attach-file`,
      formData
    );

    console.log('Resposta ao upload do anexo:------------------------', response);

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

async downloadAttachment(id: string, name: string, extension: string): Promise<ServiceResponse<void>> {
  try {
    const blob = await this.downloadFile(`/amm/invoices/${id}/download-file`);

    // cria um link temporário para download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name; // ou outro nome dinâmico
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
      error: this.NetworkErrorResponse(),
    };
  }
}


async deleteAttachment(id: string): Promise<ServiceResponse<void>> {
  try {
    await this.delete(`/amm/invoices/${id}/delete-file`);

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
      error: this.NetworkErrorResponse(),
    };
  }

}


       
    

}


