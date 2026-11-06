import HttpService from "@/app/http/httpService";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import type { IntegrationUsageType } from "@/components/settings/integration/types";
import type {
  ClassificationType,
  ContractIntegration,
  ContractIntegrationForm,
  ContractIntegrationId,
  DeductionBase,
  IntegrationModel,
  SettledAmountMode,
} from "@/components/institution/create/integration/types";

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

const CONTRACT_INTEGRATION_ENDPOINT = "/administration/contract-integrations";

const clean = (value?: string | null) => value?.trim() ?? "";

const toId = (value: ContractIntegrationId) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : value;
};

const assignWhenPresent = (payload: Record<string, any>, key: string, value?: string | null) => {
  const cleaned = clean(value);
  if (cleaned) payload[key] = cleaned;
};

const toPayload = (data: ContractIntegrationForm, mode: "create" | "update") => {
  const payload: Record<string, any> = {
    integrationDefinitionId: toId(data.integrationDefinitionId),
    integrationModel: data.integrationModel as IntegrationModel,
    classificationType: data.classificationType as ClassificationType,
    settledAmountMode: data.settledAmountMode as SettledAmountMode,
  };

  assignWhenPresent(payload, "projectCostAccount", data.projectCostAccount);
  assignWhenPresent(payload, "companyCostAccount", data.companyCostAccount);

  if (
    data.deductionLimitPercentage !== null
    && data.deductionLimitPercentage !== undefined
    && `${data.deductionLimitPercentage}` !== ""
  ) {
    payload.deductionLimitPercentage = Number(data.deductionLimitPercentage);
  }

  if (data.deductionBase) {
    payload.deductionBase = data.deductionBase as DeductionBase;
  }

  if (mode === "create") {
    payload.contractId = toId(data.contractId);
    payload.usage = data.usage as IntegrationUsageType;
  }

  return payload;
};

export default class ContractIntegrationService extends HttpService {
  private createNetworkErrorResponse(instance: string = CONTRACT_INTEGRATION_ENDPOINT): ApiErrorResponse {
    return {
      status: "error",
      message: "Network error",
      error: {
        type: "ConnectionError",
        title: "Network Error",
        status: 503,
        detail: "Could not connect to server",
        instance,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
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

  private toServiceError(error: any, instance: string): ServiceResponse<never> {
    if (error?.response) {
      return {
        status: "error",
        error: error.response.data as ApiErrorResponse,
      };
    }

    return {
      status: "error",
      error: this.createNetworkErrorResponse(instance),
    };
  }

  async getByContract(contractId: ContractIntegrationId): Promise<ServiceResponse<ContractIntegration[]>> {
    try {
      const response = await this.get<ApiResponse<ContractIntegration[]> | ContractIntegration[]>(
        `${CONTRACT_INTEGRATION_ENDPOINT}/by-contract/${contractId}`
      );

      return {
        status: "success",
        data: this.resolveListResponse(response),
      };
    } catch (error: any) {
      return this.toServiceError(error, `${CONTRACT_INTEGRATION_ENDPOINT}/by-contract/${contractId}`);
    }
  }

  async getById(id: ContractIntegrationId): Promise<ServiceResponse<ContractIntegration>> {
    try {
      const response = await this.get<ApiResponse<ContractIntegration> | ContractIntegration>(
        `${CONTRACT_INTEGRATION_ENDPOINT}/${id}`
      );

      return {
        status: "success",
        data: this.resolveSingleResponse(response),
      };
    } catch (error: any) {
      return this.toServiceError(error, `${CONTRACT_INTEGRATION_ENDPOINT}/${id}`);
    }
  }

  async create(data: ContractIntegrationForm): Promise<ServiceResponse<ContractIntegration>> {
    try {
      const response = await this.post<ApiResponse<ContractIntegration> | ContractIntegration>(
        CONTRACT_INTEGRATION_ENDPOINT,
        toPayload(data, "create")
      );

      return {
        status: "success",
        data: this.resolveSingleResponse(response),
      };
    } catch (error: any) {
      return this.toServiceError(error, CONTRACT_INTEGRATION_ENDPOINT);
    }
  }

  async update(id: ContractIntegrationId, data: ContractIntegrationForm): Promise<ServiceResponse<ContractIntegration>> {
    try {
      const response = await this.put<ApiResponse<ContractIntegration> | ContractIntegration>(
        `${CONTRACT_INTEGRATION_ENDPOINT}/${id}`,
        toPayload(data, "update")
      );

      return {
        status: "success",
        data: this.resolveSingleResponse(response),
      };
    } catch (error: any) {
      return this.toServiceError(error, `${CONTRACT_INTEGRATION_ENDPOINT}/${id}`);
    }
  }

  async remove(id: ContractIntegrationId): Promise<ServiceResponse<void>> {
    try {
      await this.delete(`${CONTRACT_INTEGRATION_ENDPOINT}/${id}`);

      return {
        status: "success",
        data: undefined,
      };
    } catch (error: any) {
      return this.toServiceError(error, `${CONTRACT_INTEGRATION_ENDPOINT}/${id}`);
    }
  }
}
