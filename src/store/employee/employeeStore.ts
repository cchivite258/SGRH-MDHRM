import { defineStore } from 'pinia';
import { employeeService } from "@/app/http/httpServiceProvider";
import type { EmployeeListingType, EmployeeInsertType } from '@/components/employee/types';
import EmployeeService from '@/app/http/services/employee/employeeService';
import { clear } from 'console';

interface EmployeeStats {
  total: number;
  enabled: number;
  disabled: number;
  byGender: {
    male: number;
    female: number;
    other?: number;
  };
}

export const useEmployeeStore = defineStore('employees', {
  state: () => ({
    employees: [] as EmployeeListingType[],
    company_employees: [] as EmployeeListingType[],
    employeesForDropdown: [] as EmployeeListingType[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    companyEmployeesPagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    employeesForDropdownPagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftEmployee: null as EmployeeInsertType | null,
    currentEmployeeId: null as string | null,
    stats: {
      total: 0,
      enabled: 0,
      disabled: 0,
      byGender: {
        male: 0,
        female: 0,
        other: 0
      }
    } as EmployeeStats,
    statsLoading: false,
    statsError: null as string | null,
    globalSearch: '',
    advancedFilters: [] as {
      prop: string;
      operator: string;
      value: string | boolean | Date;
    }[],
    logicalOperator: 'AND' as 'AND' | 'OR',
  }),

  actions: {
    async fetchEmployees( 
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc'
    ) {
      this.loading = true;
      this.error = null;

      const safeSize = this.pagination.itemsPerPage > 0 ? this.pagination.itemsPerPage : 10;
      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? safeSize;

      try {
        const { content, meta } = await employeeService.getEmployees(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          this.globalSearch,
          this.advancedFilters,
          this.logicalOperator
        );

        this.employees = content;
        const totalElements = Number(meta?.totalElements ?? content.length ?? 0);
        const currentPage = Number(meta?.page ?? actualPage ?? 0);
        const rawSize = Number(meta?.size ?? actualSize ?? 10);
        const itemsPerPage = rawSize > 0 ? rawSize : 10;
        const totalPages = Number(meta?.totalPages) || Math.ceil(totalElements / itemsPerPage);

        this.pagination = {
          totalElements,
          currentPage,
          itemsPerPage,
          totalPages
        };
        
        console.log('Colaboradores:', this.employees); 
        console.log('Meta:', this.pagination);

      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar colaboradores';
        console.error("❌ Erro ao buscar colaboradores:", err);
        this.employees = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },

    // Métodos para pesquisa avançada
    setGlobalSearch(search: string) { 
      this.globalSearch = search;
    },

      setAdvancedFilters(filters: {
      prop: string ;
      operator: string;
      value: string | boolean | Date;
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
      this.logicalOperator = 'AND';
    },

    setDraftEmployee(data: EmployeeInsertType) {
      this.draftEmployee = data;
      localStorage.setItem('employeeDraft', JSON.stringify(data));
    },
    setCurrentEmployeeId(id: string) {
      this.currentEmployeeId = id;
      localStorage.setItem('currentEmployeeId', id);
    },
    clearDraft() {
      this.draftEmployee = null;
      this.currentEmployeeId = null;
      localStorage.removeItem('employeeDraft');
      localStorage.removeItem('currentEmployeeId');
    },
    loadFromStorage() {
      const draft = localStorage.getItem('employeeDraft');
      const id = localStorage.getItem('currentEmployeeId');
      if (draft) this.draftEmployee = JSON.parse(draft);
      if (id) this.currentEmployeeId = id;
    },
    async fetchEmployeeStats() {
      this.statsLoading = true;
      this.statsError = null;

      const statsService = new EmployeeService();

      try {
        const [
          totalResponse,
          enabledResponse,
          disabledResponse,
          genderResponse
        ] = await Promise.all([
          statsService.getTotalEmployees(),
          statsService.getEnabledEmployees(),
          statsService.getDisabledEmployees(),
          statsService.getEmployeesByGender()
        ]);

        if (totalResponse.status === 'success') {
          this.stats.total = totalResponse.data || 0;
        }

        if (enabledResponse.status === 'success') {
          this.stats.enabled = enabledResponse.data || 0;
        }

        if (disabledResponse.status === 'success') {
          this.stats.disabled = disabledResponse.data || 0;
        }

        if (genderResponse.status === 'success') {
          this.stats.byGender = genderResponse.data || {
            male: 0,
            female: 0,
            other: 0
          };
        }

      } catch (err: any) {
        this.statsError = err.message || 'Erro ao buscar estatísticas';
        console.error("❌ Erro ao buscar estatísticas:", err);
      } finally {
        this.statsLoading = false;
      }
    },
    async fetchEmployeesForDropdown(
      id: string | undefined,
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;

      const safeSize = this.employeesForDropdownPagination.itemsPerPage > 0
        ? this.employeesForDropdownPagination.itemsPerPage
        : 10;
      const actualPage = page ?? this.employeesForDropdownPagination.currentPage;
      const actualSize = size ?? safeSize;

      try {
        const { content, meta } = await employeeService.getEmployeesForDropdown(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.employeesForDropdown = content;
        const totalElements = Number(meta?.totalElements ?? content.length ?? 0);
        const currentPage = Number(meta?.page ?? actualPage ?? 0);
        const rawSize = Number(meta?.size ?? actualSize ?? 10);
        const itemsPerPage = rawSize > 0 ? rawSize : 10;
        const totalPages = Number(meta?.totalPages) || Math.ceil(totalElements / itemsPerPage);

        this.employeesForDropdownPagination = {
          totalElements,
          currentPage,
          itemsPerPage,
          totalPages
        };
        console.log('Colaboradores:', this.employeesForDropdown);
        console.log('Meta:', this.employeesForDropdownPagination);

      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar colaboradores';
        console.error("❌ Erro ao buscar colaboradores:", err);
        this.employeesForDropdown = [];
        this.employeesForDropdownPagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    clearEmployeesForDropdown() {
      this.employeesForDropdown = [];
    },
    async fetchCompanyEmployees(
      id: string | undefined,
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;

      const safeSize = this.companyEmployeesPagination.itemsPerPage > 0
        ? this.companyEmployeesPagination.itemsPerPage
        : 10;
      const actualPage = page ?? this.companyEmployeesPagination.currentPage;
      const actualSize = size ?? safeSize;

      try {
        const { content, meta } = await employeeService.getCompanyEmployees(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.company_employees = content;
        const totalElements = Number(meta?.totalElements ?? content.length ?? 0);
        const currentPage = Number(meta?.page ?? actualPage ?? 0);
        const rawSize = Number(meta?.size ?? actualSize ?? 10);
        const itemsPerPage = rawSize > 0 ? rawSize : 10;
        const totalPages = Number(meta?.totalPages) || Math.ceil(totalElements / itemsPerPage);

        this.companyEmployeesPagination = {
          totalElements,
          currentPage,
          itemsPerPage,
          totalPages
        };
        console.log('Colaboradores:', this.company_employees);
        console.log('Meta:', this.companyEmployeesPagination);

      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar colaboradores';
        console.error("❌ Erro ao buscar colaboradores:", err);
        this.company_employees = [];
        this.companyEmployeesPagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
  },
  getters: {  
    enabledEmployees: (state) => {
      return state.employeesForDropdown.filter(item => item.enabled === true) 
    },
    employeeStatsForOverview: (state) => {
      const total = state.stats.total;

      return [
        {
          title: "total-employees",
          endVal: total,
          color: "primary",
          percent: "0%",
          isProgress: true,
          icon: "ph-users",
        },
        /*{
          title: "active-employees",
          endVal: state.stats.enabled,
          color: "success",
          percent: total > 0 
            ? `${Math.round((state.stats.enabled / total) * 100)}%` 
            : "0%",
          isProgress: false,
          icon: "ph-check-circle",
        },*/
        {
          title: "inactive-employees",
          endVal: state.stats.disabled,
          color: "danger",
          percent: total > 0
            ? `${Math.round((state.stats.disabled / total) * 100)}%`
            : "0%",
          isProgress: false,
          icon: "ph-x-circle",
        },
        {
          title: "male-employees",
          endVal: state.stats.byGender.male,
          color: "info",
          percent: total > 0
            ? `${Math.round((state.stats.byGender.male / total) * 100)}%`
            : "0%",
          isProgress: false,
          icon: "ph-gender-male",
        },
        {
          title: "female-employees",
          endVal: state.stats.byGender.female,
          color: "pink",
          percent: total > 0
            ? `${Math.round((state.stats.byGender.female / total) * 100)}%`
            : "0%",
          isProgress: false,
          icon: "ph-gender-female",
        }
      ];
    }

  }

});
