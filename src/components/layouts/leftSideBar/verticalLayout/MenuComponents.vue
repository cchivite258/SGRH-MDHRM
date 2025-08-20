<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { menuItems } from "@/components/layouts/utils";
import { useLayoutStore } from "@/store/app";
import { SIDEBAR_SIZE } from "@/app/const";
import QuerySearch from "@/components/layouts/leftSideBar/verticalLayout/QuerySearch.vue";
import type { MenuItemType } from "@/components/layouts/types";

const state = useLayoutStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const path = computed(() => route.path);
const isCompactSideBar = computed(() => state.sideBarSize === SIDEBAR_SIZE.COMPACT);
const searchQuery = ref("");
const openGroups = ref<Set<string>>(new Set());

// Navegação
const onClick = (path: string, isSingleLevel?: boolean) => {
  if (isSingleLevel) {
    const openListEle = document.querySelector(".v-list-group--open");
    if (openListEle) {
      const titleEle = document.querySelector(".v-list-group--open .v-list-item--active");
      if (titleEle) {
        const listItemsEle: any = document.querySelector(".v-list-group--open .v-list-group__items");
        if (listItemsEle) {
          const appendIcon = document.querySelector(".v-list-group--open .v-list-item--active .v-list-item__append .ph-caret-up");
          if (appendIcon) {
            appendIcon.classList.remove("ph-caret-up");
            appendIcon.classList.add("ph-caret-down");
            listItemsEle.style.display = "none";
            titleEle.classList.remove("v-list-item--active");
            openListEle.classList.remove("v-list-group--open");
          }
        }
      }
    }
  }
  router.push(path);
};

// Atualizar grupos abertos com base na pesquisa
watch(searchQuery, () => {
  openGroups.value.clear();
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return;

  menuItems.forEach((menu) => {
    const matchMenu =
      menu.label.toLowerCase().includes(query) ||
      t(`t-${menu.label}`).toLowerCase().includes(query);

    const matchSubMenu = (menu.subMenu || []).some((sub) => {
      const subMatch =
        sub.label.toLowerCase().includes(query) ||
        t(`t-${sub.label}`).toLowerCase().includes(query);

      const nestedMatch = (sub.subMenu || []).some((nested) =>
        nested.label.toLowerCase().includes(query) ||
        t(`t-${nested.label}`).toLowerCase().includes(query)
      );

      return subMatch || nestedMatch;
    });

    if (matchMenu || matchSubMenu) {
      openGroups.value.add(menu.label);
    }
  });
});

// Filtragem multilíngue com submenus incluídos se o menu principal for correspondente
const filteredMenuItems = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return menuItems;

  const result: MenuItemType[] = [];

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];

    const labelMatch = item.label.toLowerCase().includes(query) || t(`t-${item.label}`).toLowerCase().includes(query);

    if (item.isHeader && labelMatch) {
      // Adiciona o header
      result.push(item);

      // Adiciona todos os itens seguintes até ao próximo header
      for (let j = i + 1; j < menuItems.length; j++) {
        const nextItem = menuItems[j];
        if (nextItem.isHeader) break;
        result.push(nextItem);
      }
      continue;
    }

    // Verifica submenus e aninhados
    const hasSubMenu = item.subMenu?.some((sub) => {
      const subMatch = sub.label.toLowerCase().includes(query) || t(`t-${sub.label}`).toLowerCase().includes(query);
      const nestedMatch = sub.subMenu?.some((nested) =>
        nested.label.toLowerCase().includes(query) || t(`t-${nested.label}`).toLowerCase().includes(query)
      );
      return subMatch || nestedMatch;
    });

    if (labelMatch || hasSubMenu) {
      const filteredSubMenu = item.subMenu?.map((sub) => {
        const subMatch = sub.label.toLowerCase().includes(query) || t(`t-${sub.label}`).toLowerCase().includes(query);
        const nestedFiltered = sub.subMenu?.filter((nested) =>
          nested.label.toLowerCase().includes(query) || t(`t-${nested.label}`).toLowerCase().includes(query)
        ) || [];

        if (subMatch || nestedFiltered.length > 0) {
          return { ...sub, subMenu: nestedFiltered };
        }

        return null;
      }).filter((s): s is NonNullable<typeof s> => s !== null);

      result.push({
        ...item,
        subMenu: filteredSubMenu?.length ? filteredSubMenu : item.subMenu,
      });
    }
  }

  return result;
});

</script>


<template>
  <v-container fluid class="py-0 px-3">
    <v-list class="navbar-nav h-100 vertical-menu-component pt-0" id="navbar-nav" open-strategy="single">
      <div>
        <QuerySearch v-model="searchQuery" />
      </div>

      <v-list-group v-for="(menuItem, index) in filteredMenuItems" :key="`${menuItem.label}-${index}`"
        :class="menuItem.isHeader ? 'menu-title' : 'nav-item'" :model-value="openGroups.has(menuItem.label)">
        <template #activator="{ props }">
          <!-- Cabeçalho -->
          <v-list-item v-if="menuItem.isHeader" :data-key="`t-${menuItem.label}`" prepend-icon="" class="px-2"
            variant="text" append-icon="">
            <template #title>
              <div class="menu-title">
                {{ $t(`t-${menuItem.label}`) }}
              </div>
            </template>
          </v-list-item>

          <!-- Item sem submenu (com link) -->
          <v-list-item v-else-if="!menuItem.subMenu?.length && menuItem.link" :data-key="`t-${menuItem.label}`"
            append-icon="" class="py-0 ps-5" :value="menuItem.link" :active="menuItem.link === path" :to="menuItem.link"
            height="45" min-height="45" @click.prevent="onClick(menuItem.link, true)">
            <template #title>
              <router-link :to="menuItem.link">
                <div class="nav-link menu-link" :class="isCompactSideBar ? 'pa-2' : 'd-flex align-center'">
                  <i :class="menuItem.icon" class="ph-lg" />
                  <div>{{ $t(`t-${menuItem.label}`) }}</div>
                </div>
              </router-link>
            </template>
          </v-list-item>

          <!-- Menu principal sem link mas com submenus ou texto -->
          <v-list-item v-else :data-key="`t-${menuItem.label}`" v-bind="props"
            class="py-0 nav-link ps-5 menu-header-title" height="45" min-height="45">
            <template #title>
              <span class="nav-link menu-link" :class="isCompactSideBar ? 'pa-2' : 'd-flex align-center'">
                <i :class="menuItem.icon" class="ph-lg"></i>
                <span>{{ $t(`t-${menuItem.label}`) }}</span>
              </span>
            </template>
            <template #append="{ isActive }">
              <i v-if="!isCompactSideBar" :class="isActive ? 'ph ph-caret-up' : 'ph ph-caret-down'" class="ms-2"></i>
            </template>
          </v-list-item>
        </template>

        <!-- Submenus -->
        <v-list-group v-for="(subMenu, index) in menuItem.subMenu" :key="`submenu-${subMenu.label}-${index}`"
          :value="subMenu.link" :active="subMenu.link === path" :to="subMenu.link">
          <template #activator="{ props }">
            <v-list-item class="py-0 nav nav-sm nav-link sub-menu-list-item" density="compact" v-bind="props"
              :value="subMenu.link" :active="subMenu.link === path" :to="subMenu.link" height="38" min-height="38"
              @click.prevent="subMenu.link && onClick(subMenu.link)">
              <template #title>
                <span class="nav-link menu-link py-0">
                  {{ $t(`t-${subMenu.label}`) }}
                </span>
              </template>
              <template #append="{ isActive }">
                <i v-if="!isCompactSideBar && subMenu.subMenu?.length"
                  :class="isActive ? 'ph ph-caret-up' : 'ph ph-caret-down'"></i>
              </template>
            </v-list-item>
          </template>

          <!-- Itens de submenu aninhado -->
          <v-list-item v-for="(nestedItem, index) in subMenu.subMenu" :key="index"
            class="py-0 nav nav-sm rail-navigation-list" density="compact" :to="nestedItem.link" height="38"
            min-height="38">
            <template #title>
              <router-link v-if="nestedItem.link" :to="{ path: nestedItem.link }">
                <span class="nav-link menu-link py-0">
                  {{ $t(`t-${nestedItem.label}`) }}
                </span>
              </router-link>
              <span v-else class="nav-link menu-link py-0">
                {{ $t(`t-${nestedItem.label}`) }}
              </span>
            </template>
          </v-list-item>
        </v-list-group>
      </v-list-group>
    </v-list>
  </v-container>
</template>
