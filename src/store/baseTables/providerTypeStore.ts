import { defineStore } from 'pinia';
import { providerTypeService } from "@/app/http/httpServiceProvider";
import type {  ProviderTypeListing, ProviderTypeInsert } from '@/components/baseTables/providerType/types';

export const useProviderTypeStore = defineStore('provider_types', {
  state: () => ({
    provider_types: [] as ProviderTypeListing[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftProviderType: null as ProviderTypeInsert | null,
    currentProviderTypeId: null as string | null
  }),

  actions: {
    async fetchProviderTypes(
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

      try {
        const { content, meta } = await providerTypeService.getProviderTypes(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.provider_types = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🏛️ Tipos de Provedores:', this.provider_types);
        console.log('📊 Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar os tipos de provedores';
        this.provider_types = [];
        this.pagination.totalElements = 0;
        console.error('❌ Erro ao buscar provider types:', err);
      } finally {
        this.loading = false;
      }
    },

    setDraftProviderType(data: ProviderTypeInsert) {
      this.draftProviderType = data;
      localStorage.setItem('draftProviderType', JSON.stringify(data));
      console.log('📋 Draft salvo:', this.draftProviderType);
    },

    setCurrentProviderTypeId(id: string) {
      this.currentProviderTypeId = id;
      localStorage.setItem('currentProviderTypeId', id);
      console.log('🆔 ID atual salvo:', this.currentProviderTypeId);
    },

    clearDraft() {
      this.draftProviderType = null;
      this.currentProviderTypeId = null;
      localStorage.removeItem('draftProviderType');
      localStorage.removeItem('currentProviderTypeId');
      console.log('🧹 Draft e ID atual limpos');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('draftProviderType');
      const id = localStorage.getItem('currentProviderTypeId');
      if (draft) this.draftProviderType = JSON.parse(draft);
      if (id) this.currentProviderTypeId = id;
      console.log('📦 Carregado do armazenamento:', this.draftProviderType, this.currentProviderTypeId);
    }
  },
  
  getters: {
    enabledProviderTypes: (state) => {
      console.log('🔍 Filtrando tipos de provedores habilitados:---------', state.provider_types);
      return state.provider_types.filter(item => item.enabled === true) 
    }
  }
});