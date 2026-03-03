// stores/serviceProviderInstitutionStore.ts
import { defineStore } from 'pinia';
import { serviceProviderInstitutionService } from "@/app/http/httpServiceProvider";
import type { ServiceProviderListingType } from '@/components/institution/types';

export const useServiceProviderInstitutionStore = defineStore('service_providers_institution', { 
  state: () => ({
    service_providers: [] as ServiceProviderListingType[],
    service_providers_for_dropdown: [] as ServiceProviderListingType[],
    pagination: { 
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10000000, 
      totalPages: 0
    },
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchInstitutionServiceProviders(
      id: string | null,
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;
    
      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      console.log('🔍 Parâmetros da requisição de provedores de serviço por instituição:', {
        id,
        page: actualPage,
        size: actualSize,
        sortColumn,
        direction,
        query_value,
        query_props
      });
    
      try {
        const { content, meta } = await serviceProviderInstitutionService.getServiceProviderByInstitution( 
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.service_providers = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Prestadores de Serviço:', this.service_providers);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar prestadores de serviço';
        console.error("❌ Erro ao buscar prestadores de serviço:", err);
        this.service_providers = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    async fetchInstitutionServiceProvidersForDropdown(
      id: string | null,
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;
    
      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;
      
      console.log('🔍 Parâmetros da requisição de clínicas por instituição:', {
        id,
        page: actualPage,
        size: actualSize,
        sortColumn,
        direction,
        query_value,
        query_props
      });
    
      try {
        const { content, meta } = await serviceProviderInstitutionService.getServiceProviderByInstitutionForDropdown( 
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.service_providers_for_dropdown = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Prestadores de Serviço:', this.service_providers_for_dropdown);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar clinicas';
        console.error("❌ Erro ao buscar clinicas:", err);
        this.service_providers_for_dropdown = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    clearServiceProvidersForDropdown() {
      this.service_providers_for_dropdown = [];
    }
    
  }
});