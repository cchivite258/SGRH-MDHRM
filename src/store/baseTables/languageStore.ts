// stores/userStore.ts
import { defineStore } from 'pinia';
import { languageService } from "@/app/http/httpServiceProvider";
import type { LanguagesUpdate, LanguagesListing, LanguagesInsert } from "@/components/baseTables/languages/types";

export const useLanguagesStore = defineStore('languages', {
  state: () => ({
    languages: [] as LanguagesListing[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftLanguage: null as LanguagesInsert | null,
    currentLanguageId: null as string | null
  }),

  actions: {
    async fetchLanguages(
      page?: number,
      size?: number,
      sortColumn: string = 'name',
      direction: string = 'asc',
      query_value?: string,
      query_props?: string
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      try {
        const { content, meta } = await languageService.getLanguages(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.languages = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };

        console.log('🗣️ Línguas carregadas:', this.languages);
        console.log('📊 Paginação:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar línguas';
        this.languages = [];
        this.pagination.totalElements = 0;
        console.error('❌ Erro ao buscar línguas:', err);
      } finally {
        this.loading = false;
      }
    },

    setDraftLanguage(data: LanguagesInsert) {
      this.draftLanguage = data;
      localStorage.setItem('draftLanguage', JSON.stringify(data));
      console.log('📋 Draft de língua salvo:', this.draftLanguage);
    },

    setCurrentLanguageId(id: string) {
      this.currentLanguageId = id;
      localStorage.setItem('currentLanguageId', id);
      console.log('🆔 ID da língua atual salvo:', this.currentLanguageId);
    },

    clearDraft() {
      this.draftLanguage = null;
      this.currentLanguageId = null;
      localStorage.removeItem('draftLanguage');
      localStorage.removeItem('currentLanguageId');
      console.log('🧹 Draft e ID da língua atual limpos');
    },

    loadFromStorage() {
      const draft = localStorage.getItem('draftLanguage');
      const id = localStorage.getItem('currentLanguageId');
      if (draft) this.draftLanguage = JSON.parse(draft);
      if (id) this.currentLanguageId = id;
      console.log('📦 Carregado do armazenamento:', this.draftLanguage, this.currentLanguageId);
    }
  }
});

