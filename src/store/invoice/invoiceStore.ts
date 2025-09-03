import { defineStore } from 'pinia';
import { invoiceService } from "@/app/http/httpServiceProvider";
import type { InvoiceListingType, InvoiceInsertType } from '@/components/invoice/types';

export const useInvoiceStore = defineStore('invoices', {
  state: () => ({
    invoices: [] as InvoiceListingType[],
    invoices_list: [] as InvoiceListingType[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10000000,
      totalPages: 0
    },
    loading: false,
    error: null as string | null,
    draftInvoice: null as InvoiceInsertType | null,
    currentInvoiceId: undefined as string | undefined,
    globalSearch: '',
    advancedFilters: [] as {
      prop: string;
      operator: string;
      value: string | boolean | Date;
    }[],
    logicalOperator: 'AND' as 'AND' | 'OR',
  }),

  actions: {
    async fetchInvoices(
      page?: number,
      size?: number,
      sortColumn: string = 'createdAt', 
      direction: string = 'asc'
    ) {
      this.loading = true;
      this.error = null;

      const actualPage = page ?? this.pagination.currentPage;
      const actualSize = size ?? this.pagination.itemsPerPage;

      try {
        const { content, meta } = await invoiceService.getInvoices(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          this.globalSearch,
          this.advancedFilters,
          this.logicalOperator
        );

        this.invoices = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Facturas:', this.invoices);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar facturas';
        console.error("❌ Erro ao buscar facturas:", err);
        this.invoices = [];
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
    async fetchInvoicesForListing(
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
        const { content, meta } = await invoiceService.getInvoicesForDropdown(
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );

        this.invoices_list = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Facturas:', this.invoices_list);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar facturas';
        console.error("❌ Erro ao buscar facturas:", err);
        this.invoices_list = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    setDraftInvoice(data: InvoiceInsertType) {
      this.draftInvoice = data;
      localStorage.setItem('invoiceDraft', JSON.stringify(data));
    },
    setCurrentInvoiceId(id: string) {
      this.currentInvoiceId = id;
      localStorage.setItem('currentInvoiceId', id);
    },
    clearDraft() {
      this.draftInvoice = null;
      this.currentInvoiceId = undefined;
      localStorage.removeItem('invoiceDraft');
      localStorage.removeItem('currentInvoiceId');
    },
    loadFromStorage() {
      const draft = localStorage.getItem('invoiceDraft');
      const id = localStorage.getItem('currentInvoiceId');
      if (draft) this.draftInvoice = JSON.parse(draft);
      if (id) this.currentInvoiceId = id;
    }
  }
});