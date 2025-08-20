import HttpService from "@/app/http/httpService";
import type {
  UserInsertType, UserListingType, UserUpdateType, changePasswordType,
  updatePasswordListingType, updatePasswordResponseType
} from "@/components/users/types";

export default class UserService extends HttpService {

  //get de todos utilizadores
  async getUsers(
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'createdAt',
    direction: string = 'asc',
    globalSearch?: string,
    advancedFilters: {
      prop: string;
      operator: string;
      value: string;
    }[] = [],
    logicalOperator: string = 'AND'
  ): Promise<{ content: UserListingType[]; meta: any }> { 
    try {
      // Construir parâmetros base
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortColumn,
        direction
      });

      // Adicionar pesquisa global se existir
      if (globalSearch) {
        params.append('query_props', 'firstName,lastName,email');
        params.append('query_operator', 'OR');
        params.append('query_value', globalSearch);
      }

      // Adicionar filtros avançados se existirem
      if (advancedFilters.length > 0) {
        params.append('query_props', advancedFilters.map(f => f.prop).join(','));
        params.append('query_comparision', advancedFilters.map(f => f.operator).join(','));
        params.append('query_value', advancedFilters.map(f => f.value).join(','));
        params.append('query_operator', logicalOperator);
      }

      const url = `/administration/users?${params.toString()}`;
      console.log('URL de busca de utilizadores:', url); // Log da URL para depuração
      const response = await this.get<{ data: UserListingType[]; meta: any }>(url);

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
      console.error("Erro ao buscar usuários:", error);
      throw error;
    }
  }

  async createUser(userData: UserInsertType): Promise<UserInsertType> {
    try {
      const response = await this.post<UserInsertType>("/administration/users", userData);

      console.log('response create user', response);
      return response; // Retorna os dados do utilizador criado

    } catch (error) {
      console.error("❌ Erro ao criar utilizador:", error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await this.delete(`/administration/users/${id}`);
    } catch (error) {
      console.error("❌ Erro ao deletar utilizador:", error);
      throw error;
    }
  }

  async updateUser(id: number, userData: UserUpdateType): Promise<UserListingType> {
    try {
      // Corpo da requisição conforme especificado
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      };

      const response = await this.put<UserListingType>(`/administration/users/${id}`, payload);
      return response;
    } catch (error) {
      console.error("❌ Erro ao actualizar utilizador:", error);
      throw error;
    }
  }

  async changePasswordUser(id: number, userData: changePasswordType): Promise<UserListingType> {
    try {
      // Corpo da requisição conforme especificado
      const payload = {
        newPassword: userData.newPassword,
        confirmPassword: userData.confirmPassword,
        passwordsMatching: userData.passwordsMatching,
      };

      const response = await this.put<UserListingType>(`/administration/users/change-password/${id}`, payload);
      return response;
    } catch (error) {
      console.error("❌ Erro ao mudar password:", error);
      throw error;
    }
  }

  async enableUser(id: number): Promise<void> {
    try {
      await this.put(`/administration/users/enable/${id}`);
    } catch (error) {
      console.error("❌ Erro account lock:", error);
      throw error;
    }
  }

  async updatePassword(userData: updatePasswordListingType): Promise<updatePasswordResponseType> {
      try {
        // Corpo da requisição conforme especificado
        const payload = {
          oldPassword: userData.oldPassword,
          newPassword: userData.newPassword,
          confirmPassword: userData.confirmPassword,
          passwordsMatching: userData.passwordsMatching,
        };
        
  
        const response = await this.put<updatePasswordResponseType>(`/administration/users/change-own-password`, payload);
        console.log('response update password', response);
        return response;
      } catch (error) {
        console.error("❌ Erro ao actualizar Password:", error);
        throw error;
      }
    }

}
