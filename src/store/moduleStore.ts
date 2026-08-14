import { defineStore } from "pinia";
import { moduleService } from "@/app/http/httpServiceProvider";
import type { ModuleListingType } from "@/components/users/modules/types";

export const useModuleStore = defineStore("modules", {
  state: () => ({
    modules: [] as ModuleListingType[],
    pagination: {
      totalElements: 0,
      currentPage: 0,
      itemsPerPage: 10,
      totalPages: 0,
    },
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchModules(
      page: number = 0,
      size: number = 10,
      sortColumn: string = "name",
      direction: string = "asc",
      queryValue?: string,
      queryProps?: string
    ) {
      this.loading = true;
      this.error = null;

      try {
        const { content, meta } = await moduleService.getModules(
          page,
          size,
          sortColumn,
          direction,
          queryValue,
          queryProps
        );

        this.modules = content;
        this.pagination = {
          totalElements: meta.totalElements ?? content.length,
          currentPage: meta.page ?? page,
          itemsPerPage: meta.size ?? size,
          totalPages: meta.totalPages || Math.ceil((meta.totalElements ?? content.length) / (meta.size ?? size)),
        };
      } catch (err: any) {
        this.error = err.message || "Erro ao buscar módulos";
        this.modules = [];
        this.pagination.totalElements = 0;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
