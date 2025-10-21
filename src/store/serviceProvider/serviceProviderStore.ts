import { defineStore } from 'pinia';
import { serviceProviderService } from "@/app/http/httpServiceProvider";
import type { ServiceProviderListingType, ServiceProviderInsertType, ServiceProviderListingForListType } from '@/components/serviceProvider/types';

export const useServiceProviderStore = defineStore('serviceProviders', {
  state: () => ({
    service_providers: [] as ServiceProviderListingType[],
    service_provider_list: [] as ServiceProviderListingForListType[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0 
    },
    loading: false,
    error: null as string | null,
    draftServiceProvider: null as ServiceProviderInsertType | null,
    currentServiceProviderId: null as string | null,
    globalSearch: '',
    advancedFilters: [] as {
      prop: string;
      operator: string;
      value: string | boolean | Date;
    }[],
    logicalOperator: 'AND' as 'AND' | 'OR',
  }),

  actions: {
    async fetchServiceProviders(
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      try {
        const { content, meta } = await serviceProviderService.getServiceProviders(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          this.globalSearch,
          this.advancedFilters,
          this.logicalOperator
        );

        this.service_providers = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('Clínicas:', this.service_providers);
        console.log('Meta:', this.pagination);

      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar clínicas';
        console.error("❌ Erro ao buscar clínicas:", err);
        this.service_providers = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    async fetchServiceProvidersForDropdown(
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_props?: string,
      query_value?: string
      
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      console.log('🔍 Parâmetros da requisição de clínicas:', {
        page: actualPage,
        size: actualSize,
        sortColumn,
        direction,
        query_value,
        query_props
      })

      try {
        const { content, meta } = await serviceProviderService.getServiceProvidersForDropdown(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.service_provider_list = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Provedores de servico:', this.service_provider_list);
        console.log('Meta:', this.pagination);

      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar provedores de servico';
        console.error("❌ Erro ao buscar provedores de servico:", err);
        this.service_provider_list = [];
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
    },

    setDraftServiceProvider(data: ServiceProviderInsertType) {
      this.draftServiceProvider = data;
      localStorage.setItem('serviceProviderDraft', JSON.stringify(data));
    },

    setCurrentServiceProviderId(id: string) {
      this.currentServiceProviderId = id;
      localStorage.setItem('currentServiceProviderId', id);
    },

    clearDraft() {
      this.draftServiceProvider = null;
      this.currentServiceProviderId = null;
      localStorage.removeItem('serviceProviderDraft');
      localStorage.removeItem('currentServiceProviderId');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('serviceProviderDraft');
      const id = localStorage.getItem('currentServiceProviderId');
      if (draft) this.draftServiceProvider = JSON.parse(draft);
      if (id) this.currentServiceProviderId = id;
    }
  },
   getters: {
    enabledServiceProviders: (state) => {
      return state.service_provider_list.filter(item => item.enabled === true) 
    }
  }
  
});
