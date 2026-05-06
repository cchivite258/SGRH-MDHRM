import HttpService from "@/app/http/httpService";
import type { CountryInsertType, CountryListingType, CountryUpdateType, CountryResponseType } from "@/components/baseTables/country/types";
import type { ProvinceUpdateType, ProvinceListingType, ProvinceInsertType, ProvinceResponseType } from "@/components/baseTables/country/types";
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

const normalizeCountryResponse = (raw: any): CountryResponseType => ({
  id: raw?.id ?? "",
  name: raw?.name ?? "",
  code: raw?.code ?? "",
  iso2Code: raw?.iso2Code ?? raw?.iso2_code ?? "",
  iso3Code: raw?.iso3Code ?? raw?.iso3_code ?? "",
  phoneCode: raw?.phoneCode ?? raw?.phone_code ?? "",
  currency: typeof raw?.currency === "string" ? raw.currency : raw?.currency?.name ?? "",
  currencySymbol:
    raw?.currencySymbol ??
    raw?.currency_symbol ??
    (typeof raw?.currency === "object" ? raw?.currency?.symbol : "") ??
    "",
  currencyCode:
    raw?.currencyCode ??
    raw?.currency_code ??
    (typeof raw?.currency === "string" ? raw.currency : "") ??
    (typeof raw?.currency === "object" ? raw?.currency?.code : "") ??
    "",
  nationality: raw?.nationality ?? "",
  enabled: Boolean(raw?.enabled)
});

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta ?? {};
const getEntity = <T>(response: ApiResponse<T> | T): T | undefined => {
  if (response && typeof response === "object" && "data" in (response as Record<string, any>)) {
    return (response as ApiResponse<T>).data;
  }

  if (response && typeof response === "object" && "content" in (response as Record<string, any>)) {
    return (response as ApiResponse<T>).content;
  }

  return response as T;
};

export default class CountryService extends HttpService {

  //get de todos utilizadores
  async getCountries(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: CountryListingType[], meta: any }> {
    try {
      const queryParams = [
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
      const url = `/administration/setup/countries?${queryString}`;

      const response = await this.get<ApiResponse<CountryListingType[]>>(url);

      return {
        content: getContent(response).map(normalizeCountryResponse),
        meta: getMeta(response)
      };

    } catch (error) {
      console.error("❌ Erro ao buscar países:", error);
      throw error;
    }
  }

  async getCountryByID(id: string): Promise<{ data: CountryResponseType }> {
    try {
      const response = await this.get<ApiResponse<CountryResponseType> | CountryResponseType>(
        `/administration/setup/countries/${id}`
      );

      const rawCountry = getEntity(response);
      return {
        data: normalizeCountryResponse(rawCountry)
      };
    } catch (error) {
      console.error("Erro ao buscar país por ID:", error);
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

  async createCountry(userData: CountryInsertType): Promise<ServiceResponse<CountryResponseType>> {
    try {
      const response = await this.post<ApiResponse<CountryResponseType>>("/administration/setup/countries", userData);
      console.log('response create country', response);
      return {
        status: 'success',
        data: response.data
      };

    } catch (error: any) {
     
      console.error("❌ Erro ao criar País:", error);
      throw error;
    }
  }

  private createNetworkErrorResponseCountry(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/setup/countries'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }


  async deleteCountry(id: string): Promise<void> {
    try {
      await this.delete(`/administration/setup/countries/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar País:", error);
      throw error;
    }
  }

  async updateCountry(id: string, countryData: CountryInsertType): Promise<CountryResponseType> {

    try {
      // Corpo da requisição conforme especificado
      const payload = {
        name: countryData.name,
        code: countryData.code,
        iso2Code: countryData.iso2Code,
        iso3Code: countryData.iso3Code,
        phoneCode: countryData.phoneCode,
        currency: countryData.currency,
        currencySymbol: countryData.currencySymbol,
        currencyCode: countryData.currencyCode,
        nationality: countryData.nationality,
        enabled: countryData.enabled
      };


      const response = await this.put<CountryResponseType>(`/administration/setup/countries/${id}`, payload);
      return response;
    } catch (error) {
      console.error("❌ Erro ao actualizar País:", error);
      throw error;
    }
  }


  //get de todos utilizadores
  async getProvinces(): Promise<{ content: ProvinceListingType[], meta: any }> {
    try {
      const url = `/administration/setup/provinces`;
      const response = await this.get<ApiResponse<ProvinceListingType[]>>(url);
      //console.log('response users',response);
      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("❌ Erro ao buscar Provincias:", error);
      throw error;
    }
  }

  async getProvinceByID(id: string): Promise<{ data: ProvinceResponseType }> {
    try {
     
      const response = await this.get<{ data: ProvinceResponseType; meta: any }>
        (`/administration/setup/provinces/${id}`);

      return {
        data: response.data
      };

    } catch (error) {
      console.error("Erro ao buscar Provincias por ID:", error);
      throw error;
    }
  }

  async getProvincesByCountryID(
    id: string,
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'name',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: ProvinceListingType[], meta: any }> {
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

      const url = `/administration/setup/provinces/in-country?${queryString}`;
      //console.log("URL para buscar províncias por país:", url);

      const response = await this.get<ApiResponse<ProvinceListingType[]>>(url);
      //console.log('Response de províncias por país:', response);

      return {
        content: response.data || [],
        meta: response.meta || {}
      };
    } catch (error) {
      console.error("❌ Erro ao buscar províncias por país:", error);
      throw error;
    }
  }


  async createProvince(userData: ProvinceInsertType): Promise<ServiceResponse<ProvinceInsertType>> {
    try {
      const response = await this.post<ApiResponse<CountryResponseType>>("/administration/setup/provinces", userData);
      console.log('response create user', response);

      return {
        status: 'success',
        data: response.data
      };

    } catch (error: any) {
      //   if (error.response) {
      //     return {
      //       status: 'error',
      //       error: error.response.data as ApiErrorResponse
      //     };
      //   }
      //   return {
      //     status: 'error',
      //     error: this.createNetworkErrorResponseProvince()
      //   };
      // }
      console.error("❌ Erro ao buscar províncias por país:", error);
      throw error;
    }
  }

  private createNetworkErrorResponseProvince(): ApiErrorResponse {
    return {
      status: 'error',
      message: 'Network error',
      error: {
        type: 'ConnectionError',
        title: 'Network Error',
        status: 503,
        detail: 'Could not connect to server',
        instance: '/administration/setup/provinces'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async deleteProvince(id: string): Promise<void> {
    try {
      await this.delete(`/administration/setup/provinces/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar País:", error);
      throw error;
    }
  }

  async updateProvince(id: string, userData: ProvinceUpdateType): Promise<ProvinceResponseType> {
    try {
      // Corpo da requisição conforme especificado
      const payload = {
        name: userData.name,
        code: userData.code,
        enabled: userData.enabled
      };


      const response = await this.put<ProvinceResponseType>(`/administration/setup/provinces/${id}`, payload);
      return response;
    } catch (error) {
      console.error("❌ Erro ao actualizar Provincia:", error);
      throw error;
    }
  }
}
