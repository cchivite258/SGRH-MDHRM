import HttpService from "@/app/http/httpService";
import type {
  ServiceProviderAttachmentType,
  ServiceProviderDocumentType
} from "@/components/serviceProvider/types";
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

const SERVICE_PROVIDER_ATTACHMENTS_ENDPOINT = "/administration/service-provider-attachments";

export default class ServiceProviderAttachmentService extends HttpService {
  private createNetworkErrorResponse(instance: string = SERVICE_PROVIDER_ATTACHMENTS_ENDPOINT): ApiErrorResponse {
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

  private resolveListResponse<T>(response: ApiResponse<T[] | T> | T[] | T): T[] {
    if (Array.isArray(response)) return response;

    const payload = response as ApiResponse<T[] | T>;
    const value = payload.data ?? payload.content;

    if (Array.isArray(value)) return value;
    if (value) return [value as T];
    if ((response as any)?.id) return [response as T];

    return [];
  }

  async uploadAttachment(
    serviceProviderId: string,
    file: File,
    serviceProviderDocumentType: ServiceProviderDocumentType
  ): Promise<ServiceResponse<ServiceProviderAttachmentType>> {
    try {
      const formData = new FormData();
      formData.append("serviceProviderId", serviceProviderId);
      formData.append("file", file);
      formData.append("serviceProviderDocumentType", serviceProviderDocumentType);

      const response = await this.putFile<ApiResponse<ServiceProviderAttachmentType>>(
        `${SERVICE_PROVIDER_ATTACHMENTS_ENDPOINT}/${serviceProviderId}/attach-file`,
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
  ): Promise<{ content: ServiceProviderAttachmentType[]; meta: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortColumn,
      direction
    });

    const response = await this.get<ApiResponse<ServiceProviderAttachmentType[]>>(
      `${SERVICE_PROVIDER_ATTACHMENTS_ENDPOINT}?${params.toString()}`
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

  async getAttachmentsByServiceProvider(serviceProviderId: string): Promise<ServiceResponse<ServiceProviderAttachmentType[]>> {
    try {
      const response = await this.get<ApiResponse<ServiceProviderAttachmentType[]>>(
        `${SERVICE_PROVIDER_ATTACHMENTS_ENDPOINT}/by-service-provider/${serviceProviderId}`
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
        error: this.createNetworkErrorResponse(`${SERVICE_PROVIDER_ATTACHMENTS_ENDPOINT}/by-service-provider`)
      };
    }
  }

  async getAttachmentsByServiceProviderContractExtension(
    serviceProviderContractExtensionId: string
  ): Promise<ServiceResponse<ServiceProviderAttachmentType[]>> {
    try {
      const response = await this.get<ApiResponse<ServiceProviderAttachmentType[] | ServiceProviderAttachmentType>>(
        `${SERVICE_PROVIDER_ATTACHMENTS_ENDPOINT}/by-service-provider-contract-extension/${serviceProviderContractExtensionId}?includes=serviceProviderContractExtension,fileMetadata,attachment`
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
        error: this.createNetworkErrorResponse(`${SERVICE_PROVIDER_ATTACHMENTS_ENDPOINT}/by-service-provider-contract-extension`)
      };
    }
  }

  async getAttachmentById(id: string): Promise<ServiceResponse<ServiceProviderAttachmentType>> {
    try {
      const response = await this.get<ApiResponse<ServiceProviderAttachmentType>>(
        `${SERVICE_PROVIDER_ATTACHMENTS_ENDPOINT}/${id}`
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
      await this.delete(`${SERVICE_PROVIDER_ATTACHMENTS_ENDPOINT}/${id}`);

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
        `${SERVICE_PROVIDER_ATTACHMENTS_ENDPOINT}/${id}/download-file`
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = extension && !name.endsWith(extension) ? `${name}${extension}` : name;
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
