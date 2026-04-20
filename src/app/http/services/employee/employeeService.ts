import HttpService from "@/app/http/httpService";
import type { EmployeeListingType, EmployeeInsertType, EmployeeResponseType, EmployeeCountResponse, GenderCountResponse, GenderCountItem, EmployeeBaseSalaryUpdateType } from "@/components/employee/types";
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

const EMPLOYEES_ENDPOINT = '/human-resource/employees';
const EMPLOYEES_BY_CONTRACT_ENDPOINT = `${EMPLOYEES_ENDPOINT}/in-contract`;

const getContent = <T>(response: ApiResponse<T[]>): T[] => response.content ?? response.data ?? [];
const getMeta = (response: ApiResponse<any>): any => response.metadata ?? response.meta;

const normalizeEmployee = <T extends Record<string, any>>(item: T): T => ({
  ...item,
  company: item.company ?? item.contract,
  companyId: item.companyId ?? item.contractId
});



export default class EmployeeService extends HttpService {

  //get de todos colaboradores
  async getEmployees( 
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    globalSearch?: string,
    advancedFilters: {
      prop: string;
      operator: string;
      value: string | boolean | Date;
    }[] = [],
    logicalOperator: string = 'AND'
  ): Promise<{ content: EmployeeListingType[], meta: any }> {
    try {

      // Construção manual da query string para controle total
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortColumn,
        direction
      }); 

      //filtro geral
      if (globalSearch) {
        params.append('query_props', 'employeeNumber,firstName,middleName,lastName,gender,maritalStatus,birthDate,bloodGroup,placeOfBirth,nationality,incomeTaxNumber,socialSecurityNumber,address,postalCode,email,phone,mobile,emergencyContactName,emergencyContactPhone,idCardNumber,idCardIssuer,idCardExpiryDate');
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

      const includesToUse = 'position,department,contract,province,country,dependents';
      params.append(`includes`, includesToUse);

      const url = `${EMPLOYEES_ENDPOINT}?${params.toString()}`;

      console.log('URL de busca de colaboradores:', url); // Log da URL para depuração

      const response = await this.get<ApiResponse<EmployeeListingType[]>>(url);

      console.log('Resposta da requisição:', response); // Para debug

      return {
        content: getContent(response).map((item: any) => normalizeEmployee(item)) as EmployeeListingType[],
        meta: getMeta(response) || {
          totalElements: 0,
          page: 0,
          size: 10,
          totalPages: 0
        }
      };

    } catch (error) {
      console.error("❌ Erro ao buscar colaboradores:", error);
      throw error;
    }
  }

  async getEmployeesForDropdown(
    id: string | undefined,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_props?: string,
    query_value?: string
  ): Promise<{ content: EmployeeListingType[], meta: any }> {
    try {
      // Construção manual da query string para controle total
      const queryParams = [
        `id=${id}`,
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`,
      ];



      if (query_value && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      const includesToUse = 'position,department,contract,province,country';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');


      const url = `${EMPLOYEES_BY_CONTRACT_ENDPOINT}?${queryString}`;

      console.log('URL da requisição:', url); // Para debug

      const response = await this.get<ApiResponse<EmployeeListingType[]>>(url);


      console.log('Resposta da requisição:', response); // Para debug

      return {
        content: getContent(response).map((item: any) => normalizeEmployee(item)) as EmployeeListingType[],
        meta: getMeta(response) || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar colaboradores:", error);
      throw error;
    }
  }

  async getCompanyEmployees(
    id: string | undefined,
    page: number = 0,
    size: number = 10000000,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    query_props?: string,
    query_value?: string
  ): Promise<{ content: EmployeeListingType[], meta: any }> {
    try {
      // Construção manual da query string para controle total
      const queryParams = [
        `id=${id}`,
        `page=${page}`,
        `size=${size}`,
        `sortColumn=${sortColumn}`,
        `direction=${direction}`,
      ];



      if (query_value && query_props) {
        queryParams.push(`query_props=${encodeURIComponent(query_props)}`);
        queryParams.push(`query_value=${encodeURIComponent(query_value)}`);
      }

      const includesToUse = 'position,department,contract,province,country';
      queryParams.push(`includes=${includesToUse}`);

      const queryString = queryParams.join('&');


      const url = `${EMPLOYEES_BY_CONTRACT_ENDPOINT}?${queryString}`;

      console.log('URL da requisição:', url); // Para debug

      const response = await this.get<ApiResponse<EmployeeListingType[]>>(url);


      console.log('Resposta da requisição:', response); // Para debug

      return {
        content: getContent(response).map((item: any) => normalizeEmployee(item)) as EmployeeListingType[],
        meta: getMeta(response) || []
      };

    } catch (error) {
      console.error("❌ Erro ao buscar colaboradores:", error);
      throw error;
    }
  }

  async createEmployee(employeeData: EmployeeInsertType): Promise<ServiceResponse<EmployeeResponseType>> {
    try {
      const response = await this.post<ApiResponse<EmployeeResponseType>>(EMPLOYEES_ENDPOINT, {
        ...employeeData,
        contract: employeeData.company,
        company: undefined
      });
      return {
        status: 'success',
        data: normalizeEmployee((response.data ?? response.content ?? response) as any) as EmployeeResponseType
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
        instance: EMPLOYEES_ENDPOINT
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  async getEmployeeById(id: string): Promise<{ data: EmployeeResponseType }> {
    try {
      console.log('ID recebido para busca:', id);
      const response = await this.get<{ data: EmployeeResponseType; meta: any }>
        (`${EMPLOYEES_ENDPOINT}/${id}?includes=position,department,contract,province,country,employeeBaseSalaryTracks`);
      console.log('Resposta da requisição id:------------------------', response);
      return {
        data: normalizeEmployee(((response as any).data ?? response) as any) as EmployeeResponseType
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEmployeeSalaryTracks(id: string): Promise<EmployeeResponseType | null> {
    try {
      const params = new URLSearchParams({
        page: "0",
        size: "1",
        sortColumn: "createdAt",
        direction: "desc",
        query_props: "id",
        query_comparision: "equals",
        query_value: id,
        includes: "employeeBaseSalaryTrack"
      });

      const url = `${EMPLOYEES_ENDPOINT}?${params.toString()}`;
      console.log("URL de busca do histórico salarial:", url);

      const response = await this.get<ApiResponse<EmployeeResponseType[]>>(
        url
      );
      console.log("getEmployeeSalaryTracks", response);

      return getContent(response)[0] || null;
    } catch (error) {
      console.error("Erro ao buscar histórico salarial do colaborador:", error);
      return null;
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

  async updateEmployee(id: string, employeeData: EmployeeInsertType): Promise<EmployeeResponseType> {
    try {

      console.log('employeeData on update', employeeData.baseSalary)
      // Corpo da requisição conforme especificado
      const payload = {
        employeeNumber: employeeData.employeeNumber,
        firstName: employeeData.firstName,
        middleName: employeeData.middleName,
        lastName: employeeData.lastName,
        gender: employeeData.gender,
        maritalStatus: employeeData.maritalStatus,
        birthDate: employeeData.birthDate,
        bloodGroup: employeeData.bloodGroup,
        placeOfBirth: employeeData.placeOfBirth,
        nationality: employeeData.nationality,
        incomeTaxNumber: employeeData.incomeTaxNumber,
        socialSecurityNumber: employeeData.socialSecurityNumber,
        address: employeeData.address,
        country: employeeData.country,
        province: employeeData.province,
        postalCode: employeeData.postalCode,
        email: employeeData.email,
        phone: employeeData.phone,
        mobile: employeeData.mobile,
        emergencyContactName: employeeData.emergencyContactName,
        emergencyContactPhone: employeeData.emergencyContactPhone,
        idCardNumber: employeeData.idCardNumber,
        idCardIssuer: employeeData.idCardIssuer,
        idCardExpiryDate: employeeData.idCardExpiryDate,
        isLifeTimeCard: employeeData.isLifeTimeCard,
        idCardIssuanceDate: employeeData.idCardIssuanceDate,
        passportNumber: employeeData.passportNumber,
        passportIssuer: employeeData.passportIssuer,
        passportExpiryDate: employeeData.passportExpiryDate,
        passportIssuanceDate: employeeData.passportIssuanceDate,
        baseSalary: employeeData.baseSalary,
        contract: employeeData.company,
        department: employeeData.department,
        position: employeeData.position,
        contractDurationType: employeeData.contractDurationType,
        hireDate: employeeData.hireDate,
        terminationDate: employeeData.terminationDate,
        rehireDate: employeeData.rehireDate,
        enabled: employeeData.enabled
      };

      const response = await this.put<EmployeeResponseType>(`${EMPLOYEES_ENDPOINT}/${id}`, payload);
      console.log('response update', response)
      return response;

    } catch (error) {
      console.error("❌ Erro ao actualizar colaborador:", error);
      throw error;
    }
  }

  async updateBaseSalary(id: string, payload: EmployeeBaseSalaryUpdateType): Promise<ServiceResponse<EmployeeResponseType>> {
    try {
      const response = await this.post<ApiResponse<EmployeeResponseType>>(
        `${EMPLOYEES_ENDPOINT}/${id}/update-base-salary`,
        payload
      );

      return {
        status: 'success',
        data: normalizeEmployee((response.data ?? response.content ?? response) as any) as EmployeeResponseType
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

  async deleteEmployee(id: string): Promise<void> {
    try {
      await this.delete(`${EMPLOYEES_ENDPOINT}/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar colaborador:", error);
      throw error;
    }
  }

  async getTotalEmployees(): Promise<ServiceResponse<number>> {
    try {
      const response = await this.get<EmployeeCountResponse>(`${EMPLOYEES_ENDPOINT}/count`);
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      return error;
    }
  }

  async getEnabledEmployees(): Promise<ServiceResponse<number>> {
    try {
      const response = await this.get<EmployeeCountResponse>(`${EMPLOYEES_ENDPOINT}/count-enabled-true`);
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      return error;
    }
  }

  async getDisabledEmployees(): Promise<ServiceResponse<number>> {
    try {
      const response = await this.get<EmployeeCountResponse>(`${EMPLOYEES_ENDPOINT}/count-enabled-false`);
      return {
        status: 'success',
        data: response.data
      };
    } catch (error: any) {
      return error;
    }
  }

  async getEmployeesByGender(): Promise<ServiceResponse<{ male: number; female: number; other: number }>> {
    try {
      const response = await this.get<GenderCountResponse>(`${EMPLOYEES_ENDPOINT}/count-by-gender`);

      // Processa os dados de gênero para o formato esperado
      const genderData = {
        male: 0,
        female: 0,
        other: 0
      };

      response.data.forEach(item => {
        if (item.gender === 'MALE') genderData.male = item.count;
        if (item.gender === 'FEMALE') genderData.female = item.count;
        // Adicione outros gêneros se necessário
      });

      return {
        status: 'success',
        data: genderData
      };
    } catch (error: any) {
      return error;
    }
  }





}
