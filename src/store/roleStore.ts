import { defineStore } from "pinia";
import { roleService } from "@/app/http/httpServiceProvider";
import type { RoleListingType } from "@/components/users/roles/types";

export const useRoleStore = defineStore("roles", {
  state: () => ({
    roles: [] as RoleListingType[],
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
    async fetchRoles(
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
        const { content, meta } = await roleService.getRoles(
          page,
          size,
          sortColumn,
          direction,
          queryValue,
          queryProps
        );

        this.roles = content;
        this.pagination = {
          totalElements: meta.totalElements ?? content.length,
          currentPage: meta.page ?? page,
          itemsPerPage: meta.size ?? size,
          totalPages: meta.totalPages || Math.ceil((meta.totalElements ?? content.length) / (meta.size ?? size)),
        };
      } catch (err: any) {
        this.error = err.message || "Erro ao buscar roles";
        this.roles = [];
        this.pagination.totalElements = 0;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
