import HttpService from "@/app/http/httpService";
import type {
  ContractAttachmentType,
  ContractDocumentType
} from "@/components/institution/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

interface ApiResponse<T> {
  data?: T;
  content?: T;
  meta?: any;
  metadata?: any;
}

interface ServiceResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: ApiErrorResponse;
}

const CONTRACT_ATTACHMENTS_ENDPOINT = "/administration/contract-attachments";

export default class ContractAttachmentService extends HttpService {
  private createNetworkErrorResponse(instance: string = CONTRACT_ATTACHMENTS_ENDPOINT): ApiErrorResponse {
    return {
      status: "error",
      message: "Network error",
      error: {
        type: "ConnectionError",
        title: "Network Error",
        status: 503,
        detail: "Could not connect to server",
        instance
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  private resolveSingleResponse<T>(response: ApiResponse<T> | T): T {
    const payload = response as ApiResponse<T>;
    return (payload.data ?? payload.content ?? response) as T;
  }

  private resolveListResponse<T>(response: ApiResponse<T[]> | T[]): T[] {
    if (Array.isArray(response)) return response;

    return response.data ?? response.content ?? [];
  }

  async uploadAttachment(
    contractId: string,
    file: File,
    contractDocumentType: ContractDocumentType
  ): Promise<ServiceResponse<ContractAttachmentType>> {
    try {
      const formData = new FormData();
      formData.append("contractId", contractId);
      formData.append("file", file);
      formData.append("contractDocumentType", contractDocumentType);

      const response = await this.putFile<ApiResponse<ContractAttachmentType>>(
        `${CONTRACT_ATTACHMENTS_ENDPOINT}/${contractId}/attach-file`,
        formData
      );

      return {
        status: "success",
        data: this.resolveSingleResponse(response)
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: "error",
          error: error.response.data as ApiErrorResponse
        };
      }

      return {
        status: "error",
        error: this.createNetworkErrorResponse()
      };
    }
  }

  async getAttachments(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "createdAt",
    direction: string = "asc"
  ): Promise<{ content: ContractAttachmentType[]; meta: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortColumn,
      direction
    });

    const response = await this.get<ApiResponse<ContractAttachmentType[]>>(
      `${CONTRACT_ATTACHMENTS_ENDPOINT}?${params.toString()}`
    );

    return {
      content: this.resolveListResponse(response),
      meta: response.metadata ?? response.meta ?? {
        totalElements: 0,
        page,
        size,
        totalPages: 0
      }
    };
  }

  async getAttachmentsByContract(contractId: string): Promise<ServiceResponse<ContractAttachmentType[]>> {
    try {
      const response = await this.get<ApiResponse<ContractAttachmentType[]>>(
        `${CONTRACT_ATTACHMENTS_ENDPOINT}/by-contract/${contractId}`
      );

      return {
        status: "success",
        data: this.resolveListResponse(response)
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: "error",
          error: error.response.data as ApiErrorResponse
        };
      }

      return {
        status: "error",
        error: this.createNetworkErrorResponse(`${CONTRACT_ATTACHMENTS_ENDPOINT}/by-contract`)
      };
    }
  }

  async getAttachmentById(id: string): Promise<ServiceResponse<ContractAttachmentType>> {
    try {
      const response = await this.get<ApiResponse<ContractAttachmentType>>(
        `${CONTRACT_ATTACHMENTS_ENDPOINT}/${id}`
      );

      return {
        status: "success",
        data: this.resolveSingleResponse(response)
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: "error",
          error: error.response.data as ApiErrorResponse
        };
      }

      return {
        status: "error",
        error: this.createNetworkErrorResponse()
      };
    }
  }

  async deleteAttachment(id: string): Promise<ServiceResponse<void>> {
    try {
      await this.delete(`${CONTRACT_ATTACHMENTS_ENDPOINT}/${id}`);

      return {
        status: "success",
        data: undefined
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: "error",
          error: error.response.data as ApiErrorResponse
        };
      }

      return {
        status: "error",
        error: this.createNetworkErrorResponse()
      };
    }
  }

  async downloadAttachment(id: string, name: string, extension: string): Promise<ServiceResponse<void>> {
    try {
      const blob = await this.downloadFile(
        `${CONTRACT_ATTACHMENTS_ENDPOINT}/${id}/download-file`
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = extension && !name.endsWith(`.${extension}`) ? `${name}.${extension}` : name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return {
        status: "success",
        data: undefined
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: "error",
          error: error.response.data as ApiErrorResponse
        };
      }

      return {
        status: "error",
        error: this.createNetworkErrorResponse()
      };
    }
  }
}
