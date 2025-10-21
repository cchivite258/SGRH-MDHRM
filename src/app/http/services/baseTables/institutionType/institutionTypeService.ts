import HttpService from "@/app/http/httpService";
import type { InstitutionTypeListingType } from "@/components/baseTables/institutionType/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

export default class InstitutionTypeService extends HttpService {

  async getInstitutionTypes(
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_value?: string,
    query_props?: string
  ): Promise<{ content: InstitutionTypeListingType[], meta: any }> {
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
      const url = `/administration/setup/institution-types?${queryString}`;

      console.log('URL da requisição institution type:', url);

      const response = await this.get(url) as {
        data: InstitutionTypeListingType[],
        meta?: any
      };

      console.log('Resposta da requisição:', response);

      return {
        content: response.data || [],
        meta: response.meta || {}
      };

    } catch (error) {
      console.error("❌ Erro ao buscar tipos de instituição:", error);
      throw new Error("Erro ao buscar tipos de instituição");
    }
  }

}
