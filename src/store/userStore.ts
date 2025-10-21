// stores/userStore.ts
import { defineStore } from 'pinia';
import { userService } from "@/app/http/httpServiceProvider";
import { authService } from "@/app/http/httpServiceProvider";
import type { UserType1 } from '@/app/http/types';

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [] as UserType1[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    globalSearch: '',
    advancedFilters: [] as {
      prop: string;
      operator: string;
      value: string;
    }[],
    logicalOperator: 'AND' as 'AND' | 'OR'
  }),
  actions: {
    async fetchUsers(
      page: number = 0,
      size: number = 10,
      sortColumn: string = 'createdAt',
      direction: string = 'asc'
    ) {
      this.loading = true;
      this.error = null;

      try {
        const { content, meta } = await userService.getUsers(
          page,
          size,
          sortColumn,
          direction,
          this.globalSearch,
          this.advancedFilters,
          this.logicalOperator
        );

        this.users = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar usuários';
        this.users = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },

    setGlobalSearch(search: string) {
      this.globalSearch = search;
    },

    setAdvancedFilters(filters: {
      prop: string;
      operator: string;
      value: string;
    }[]) {
      this.advancedFilters = filters;
      console.log('Advanced filters set:', this.advancedFilters);
    },

    setLogicalOperator(operator: 'AND' | 'OR') {
      this.logicalOperator = operator;
    },

    clearFilters() {
      this.globalSearch = '';
      this.advancedFilters = [];
    }

  }
});

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: [] as UserType1[],
    error: null as string | null,
    loading: false,
  }),
  actions: {
    async fetchProfile() {
      this.error = null;
      this.loading = true;
      try {
        const response = await authService.getUserProfile();
        this.profile = response.data;
        console.log("this.profile ===> ", this.profile)
        console.log('response profile', response);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar profile';
        console.error("❌ Erro ao buscar profile:", err);
      }
      finally {
        this.loading = false;
      }
    },
  },
});

