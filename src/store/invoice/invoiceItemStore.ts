// stores/departmentStore.ts
import { defineStore } from 'pinia';
import { invoiceItemService } from "@/app/http/httpServiceProvider";
import type { InvoiceItemListingType } from '@/components/invoice/types';

export const useContactPersonStore = defineStore('invoice_items', { 
  state: () => ({
    invoice_items: [] as InvoiceItemListingType[],
    pagination: { 
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 5, 
      totalPages: 0
    },
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchInvoiceItems(
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
    
      try {
        const { content, meta } = await invoiceItemService.getInvoiceItemByInvoice(
          id,
          actualPage,
          actualSize,
          sortColumn,
          direction,
          query_value,
          query_props
        );
    
        this.invoice_items = content;
        this.pagination = {
          totalElements: meta.totalElements,
          currentPage: meta.page,
          itemsPerPage: meta.size,
          totalPages: meta.totalPages || Math.ceil(meta.totalElements / meta.size)
        };
        console.log('Itens da Factura:', this.invoice_items);
        console.log('Meta:', this.pagination);
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar itens da factura';
        console.error("❌ Erro ao buscar itens da factura:", err);
        this.invoice_items = [];
        this.pagination.totalElements = 0;
      } finally {
        this.loading = false;
      }
    }
    
  }
});