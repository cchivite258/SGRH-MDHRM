import HttpService from "@/app/http/httpService";
import type {
  ContractParticipantPayloadType,
  ContractParticipantType
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

const CONTRACT_PARTICIPANTS_ENDPOINT = "/administration/contract-participants";

export default class ContractParticipantService extends HttpService {
  private createNetworkErrorResponse(instance: string = CONTRACT_PARTICIPANTS_ENDPOINT): ApiErrorResponse {
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

  async getParticipants(
    page: number = 0,
    size: number = 10,
    sortColumn: string = "createdAt",
    direction: string = "asc"
  ): Promise<{ content: ContractParticipantType[]; meta: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortColumn,
      direction
    });

    const response = await this.get<ApiResponse<ContractParticipantType[]>>(
      `${CONTRACT_PARTICIPANTS_ENDPOINT}?${params.toString()}`
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

  async getParticipantById(id: string): Promise<ServiceResponse<ContractParticipantType>> {
    try {
      const response = await this.get<ApiResponse<ContractParticipantType>>(
        `${CONTRACT_PARTICIPANTS_ENDPOINT}/${id}`
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

  async getParticipantsByContract(
    contractId: string | number,
    page: number = 0,
    size: number = 10,
    sortColumn: string = "createdAt",
    direction: string = "asc",
    query_value?: string,
    query_props?: string
  ): Promise<ServiceResponse<{ content: ContractParticipantType[]; meta: any }>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortColumn,
        direction
      });

      if (query_value && query_props) {
        params.append("query_props", query_props);
        params.append("query_value", query_value);
        params.append("query_operator", "OR");
      }

      const response = await this.get<ApiResponse<ContractParticipantType[]>>(
        `${CONTRACT_PARTICIPANTS_ENDPOINT}/by-contract/${contractId}?${params.toString()}`
      );

      return {
        status: "success",
        data: {
          content: this.resolveListResponse(response),
          meta: response.metadata ?? response.meta ?? {
            totalElements: 0,
            page,
            size,
            totalPages: 0
          }
        }
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
        error: this.createNetworkErrorResponse(`${CONTRACT_PARTICIPANTS_ENDPOINT}/by-contract`)
      };
    }
  }

  async getParticipantsByParticipant(participantId: string | number): Promise<ServiceResponse<ContractParticipantType[]>> {
    try {
      const response = await this.get<ApiResponse<ContractParticipantType[]>>(
        `${CONTRACT_PARTICIPANTS_ENDPOINT}/by-participant/${participantId}`
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
        error: this.createNetworkErrorResponse(`${CONTRACT_PARTICIPANTS_ENDPOINT}/by-participant`)
      };
    }
  }

  async createParticipant(payload: ContractParticipantPayloadType): Promise<ServiceResponse<ContractParticipantType>> {
    try {
      const response = await this.post<ApiResponse<ContractParticipantType>>(
        CONTRACT_PARTICIPANTS_ENDPOINT,
        payload
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

  async updateParticipant(
    id: string,
    payload: ContractParticipantPayloadType
  ): Promise<ServiceResponse<ContractParticipantType>> {
    try {
      const response = await this.put<ApiResponse<ContractParticipantType>>(
        `${CONTRACT_PARTICIPANTS_ENDPOINT}/${id}`,
        payload
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

  async deleteParticipant(id: string): Promise<ServiceResponse<void>> {
    try {
      await this.delete(`${CONTRACT_PARTICIPANTS_ENDPOINT}/${id}`);

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
