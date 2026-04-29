<script lang="ts" setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { menuItems } from "@/components/layouts/utils";
import { useLayoutStore } from "@/store/app";
import { SIDEBAR_SIZE } from "@/app/const";
import type { MenuItemType, SubMenuItemType } from "@/components/layouts/types";

const state = useLayoutStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  }
});

const path = computed(() => route.path);
const isCompactSideBar = computed(() => state.sideBarSize === SIDEBAR_SIZE.COMPACT);

const searchQuery = computed({
  get() {
    return props.modelValue || "";
  },
  set(value: string) {
    emit("update:modelValue", value);
  }
});

const isSubMenuCurrent = (subMenu: SubMenuItemType) => {
  if (subMenu.link === path.value) return true;
  return (subMenu.subMenu || []).some((nestedItem) => nestedItem.link === path.value);
};

const hasCurrentDescendant = (menuItem: MenuItemType) => {
  return (menuItem.subMenu || []).some((subMenu) => isSubMenuCurrent(subMenu));
};

const onClick = (targetPath: string) => {
  router.push(targetPath);
};

const filteredMenuItems = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return menuItems;

  const result: MenuItemType[] = [];

  for (let index = 0; index < menuItems.length; index += 1) {
    const item = menuItems[index];
    const labelMatch =
      item.label.toLowerCase().includes(query) ||
      t(`t-${item.label}`).toLowerCase().includes(query);

    if (item.isHeader && labelMatch) {
      result.push(item);

      for (let nextIndex = index + 1; nextIndex < menuItems.length; nextIndex += 1) {
        const nextItem = menuItems[nextIndex];
        if (nextItem.isHeader) break;
        result.push(nextItem);
      }
      continue;
    }

    const hasSubMenu = item.subMenu?.some((subMenu) => {
      const subMatch =
        subMenu.label.toLowerCase().includes(query) ||
        t(`t-${subMenu.label}`).toLowerCase().includes(query);
      const nestedMatch = subMenu.subMenu?.some((nestedItem) =>
        nestedItem.label.toLowerCase().includes(query) ||
        t(`t-${nestedItem.label}`).toLowerCase().includes(query)
      );
      return subMatch || nestedMatch;
    });

    if (labelMatch || hasSubMenu) {
      const filteredSubMenu = item.subMenu
        ?.map((subMenu) => {
          const subMatch =
            subMenu.label.toLowerCase().includes(query) ||
            t(`t-${subMenu.label}`).toLowerCase().includes(query);
          const nestedFiltered =
            subMenu.subMenu?.filter((nestedItem) =>
              nestedItem.label.toLowerCase().includes(query) ||
              t(`t-${nestedItem.label}`).toLowerCase().includes(query)
            ) || [];

          if (subMatch || nestedFiltered.length > 0) {
            return { ...subMenu, subMenu: nestedFiltered };
          }

          return null;
        })
        .filter((value): value is NonNullable<typeof value> => value !== null);

      result.push({
        ...item,
        subMenu: filteredSubMenu?.length ? filteredSubMenu : item.subMenu
      });
    }
  }

  return result;
});
</script>

<template>
  <v-container fluid class="py-0 px-3 menu-components-shell">
    <v-list class="navbar-nav h-100 vertical-menu-component pt-0" id="navbar-nav">
      <template v-for="(menuItem, index) in filteredMenuItems" :key="`${menuItem.label}-${index}`">
        <v-list-item
          v-if="menuItem.isHeader"
          :data-key="`t-${menuItem.label}`"
          prepend-icon=""
          class="px-2 menu-section-header"
          variant="text"
          append-icon=""
        >
          <template #title>
            <div class="menu-title">
              {{ $t(`t-${menuItem.label}`) }}
            </div>
          </template>
        </v-list-item>

        <v-list-item
          v-else-if="!menuItem.subMenu?.length && menuItem.link"
          :data-key="`t-${menuItem.label}`"
          append-icon=""
          class="py-0 ps-3 menu-leaf-item"
          :value="menuItem.link"
          :active="menuItem.link === path"
          :to="menuItem.link"
          height="45"
          min-height="45"
          @click.prevent="onClick(menuItem.link)"
        >
          <template #title>
            <router-link :to="menuItem.link">
              <div class="nav-link menu-link" :class="isCompactSideBar ? 'pa-2' : 'd-flex align-center'">
                <i :class="menuItem.icon" class="ph-lg" />
                <div>{{ $t(`t-${menuItem.label}`) }}</div>
              </div>
            </router-link>
          </template>
        </v-list-item>

        <v-menu
          v-else
          location="end top"
          offset="12"
          open-on-hover
          open-on-click
          class="menu-side-menu"
          content-class="menu-side-menu__content"
        >
          <template #activator="{ props: activatorProps }">
            <v-list-item
              :data-key="`t-${menuItem.label}`"
              v-bind="activatorProps"
              class="py-0 nav-link ps-3 menu-header-title menu-parent-item"
              :class="{ 'is-current': hasCurrentDescendant(menuItem) }"
              height="45"
              min-height="45"
              :ripple="false"
            >
              <template #title>
                <span class="nav-link menu-link" :class="isCompactSideBar ? 'pa-2' : 'd-flex align-center'">
                  <i :class="menuItem.icon" class="ph-lg"></i>
                  <span>{{ $t(`t-${menuItem.label}`) }}</span>
                </span>
              </template>
              <template #append>
                <i v-if="!isCompactSideBar" class="ph ph-caret-right ms-2"></i>
              </template>
            </v-list-item>
          </template>

          <div class="menu-side-panel">
            <div class="menu-side-panel__title">
              {{ $t(`t-${menuItem.label}`) }}
            </div>

            <v-list density="compact" class="menu-side-panel__list" bg-color="transparent">
              <template v-for="(subMenu, subIndex) in menuItem.subMenu" :key="`submenu-${subMenu.label}-${subIndex}`">
                <v-list-item
                  v-if="!subMenu.subMenu?.length"
                  class="py-0 nav nav-sm nav-link sub-menu-list-item premium-submenu-item menu-side-panel__item"
                  :class="{ 'is-current': isSubMenuCurrent(subMenu) }"
                  density="compact"
                  :value="subMenu.link"
                  :active="subMenu.link === path"
                  :to="subMenu.link"
                  :ripple="false"
                  @click.prevent="subMenu.link && onClick(subMenu.link)"
                >
                  <template #title>
                    <span class="nav-link menu-link py-0">
                      {{ $t(`t-${subMenu.label}`) }}
                    </span>
                  </template>
                </v-list-item>

                <v-menu
                  v-else
                  location="end top"
                  offset="10"
                  open-on-hover
                  open-on-click
                  class="submenu-side-menu"
                  content-class="submenu-side-menu__content"
                >
                  <template #activator="{ props: subActivatorProps }">
                    <v-list-item
                      class="py-0 nav nav-sm nav-link sub-menu-list-item premium-submenu-item menu-side-panel__item"
                      :class="{ 'is-current': isSubMenuCurrent(subMenu) }"
                      density="compact"
                      v-bind="subActivatorProps"
                      :value="subMenu.link"
                      :active="isSubMenuCurrent(subMenu)"
                      :ripple="false"
                    >
                      <template #title>
                        <span class="nav-link menu-link py-0">
                          {{ $t(`t-${subMenu.label}`) }}
                        </span>
                      </template>
                      <template #append>
                        <i v-if="!isCompactSideBar" class="ph ph-caret-right"></i>
                      </template>
                    </v-list-item>
                  </template>

                  <div class="submenu-side-panel">
                    <div class="submenu-side-panel__title">
                      {{ $t(`t-${subMenu.label}`) }}
                    </div>

                    <v-list density="compact" class="submenu-side-panel__list" bg-color="transparent">
                      <v-list-item
                        v-for="(nestedItem, nestedIndex) in subMenu.subMenu"
                        :key="nestedIndex"
                        :class="{ 'is-current': nestedItem.link === path }"
                        class="py-0 nav nav-sm rail-navigation-list premium-nested-item submenu-side-panel__item"
                        density="compact"
                        :to="nestedItem.link"
                        :ripple="false"
                      >
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
                    </v-list>
                  </div>
                </v-menu>
              </template>
            </v-list>
          </div>
        </v-menu>
      </template>
    </v-list>
  </v-container>
</template>

<style scoped>
.menu-components-shell {
  padding-top: 2px;
}

.vertical-menu-component {
  gap: 1px;
  background: transparent;
  color: #dbe7f5;
  padding-bottom: 20px;
}

.vertical-menu-component :deep(.v-list-item) {
  border-radius: 14px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}

.menu-section-header {
  min-height: 24px;
  margin-top: 10px;
}

.menu-title {
  color: #7f95b0;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.menu-leaf-item :deep(.v-list-item__content),
.menu-parent-item :deep(.v-list-item__content) {
  position: relative;
}

.menu-leaf-item :deep(.menu-link),
.menu-parent-item :deep(.menu-link) {
  gap: 5px;
  color: #dce7f4;
  font-size: 0.74rem;
  font-weight: 700;
}

.menu-leaf-item :deep(.menu-link i),
.menu-parent-item :deep(.menu-link i) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(83, 142, 204, 0.18);
  color: #8fc0ff;
  font-size: 0.96rem;
  flex: 0 0 32px;
}

.menu-leaf-item.v-list-item--active,
.menu-parent-item.v-list-item--active,
.menu-parent-item.is-current {
  background: linear-gradient(90deg, rgba(56, 116, 184, 0.34), rgba(56, 116, 184, 0.12));
  border: 1px solid rgba(114, 175, 255, 0.24);
}

.menu-leaf-item:hover,
.menu-parent-item:hover,
.premium-submenu-item:hover,
.premium-nested-item:hover {
  transform: translateX(1px);
  background: rgba(255, 255, 255, 0.04);
}

.menu-leaf-item.v-list-item--active :deep(.menu-link),
.menu-parent-item.v-list-item--active :deep(.menu-link),
.menu-parent-item.is-current :deep(.menu-link) {
  color: #ffffff;
}

.menu-leaf-item.v-list-item--active :deep(.menu-link i),
.menu-parent-item.v-list-item--active :deep(.menu-link i),
.menu-parent-item.is-current :deep(.menu-link i) {
  background: linear-gradient(135deg, #4f9cf7 0%, #3478b7 100%);
  color: #fff;
}

.menu-parent-item,
.menu-leaf-item {
  min-height: 48px;
  margin-bottom: 0;
  padding-right: 8px;
  border: 1px solid transparent;
  background: transparent;
}

.premium-submenu-item,
.premium-nested-item {
  min-height: 0;
  margin-bottom: 0;
  padding-inline: 0;
  padding-top: 4px;
  padding-bottom: 4px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  align-items: flex-start;
}

.premium-submenu-item :deep(.menu-link),
.premium-nested-item :deep(.menu-link) {
  display: block;
  color: #c4d2e3;
  font-size: 0.73rem;
  font-weight: 500;
  white-space: normal;
  line-height: 1.35;
  word-break: break-word;
}

.premium-submenu-item :deep(.v-list-item__append i) {
  color: #96aeca;
}

.premium-submenu-item :deep(.v-list-item__prepend),
.premium-nested-item :deep(.v-list-item__prepend),
.premium-submenu-item :deep(.v-list-item__spacer),
.premium-nested-item :deep(.v-list-item__spacer) {
  display: none;
}

.premium-nested-item {
  padding-left: 0;
}

.premium-nested-item :deep(.menu-link) {
  position: relative;
  display: block;
  padding-left: 14px;
}

.premium-nested-item :deep(.menu-link)::before {
  position: absolute;
  top: 50%;
  left: 0;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #7f95b0;
  content: "";
  transform: translateY(-50%);
}

.premium-submenu-item.is-current,
.premium-nested-item.is-current {
  background: rgba(255, 255, 255, 0.05);
  border: 0;
}

.premium-submenu-item.is-current :deep(.menu-link),
.premium-nested-item.is-current :deep(.menu-link) {
  color: #ffffff;
}

.premium-submenu-item.is-current {
  position: relative;
}

.premium-submenu-item.is-current::before {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: -13px;
  width: 2px;
  border-radius: 999px;
  background: #4f9cf7;
  content: "";
}

.menu-side-panel,
.submenu-side-panel {
  min-width: 0;
  max-width: 100%;
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(105, 129, 161, 0.24);
  border-radius: 14px;
  background: linear-gradient(180deg, #132033 0%, #0f1a2c 100%);
  box-shadow: 0 16px 36px rgba(3, 8, 15, 0.38);
  overflow: hidden;
  overflow-x: hidden;
  box-sizing: border-box;
}

.menu-side-panel *,
.submenu-side-panel * {
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.menu-side-panel__title,
.submenu-side-panel__title {
  color: #f8fbff;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 8px;
  padding: 2px 6px 8px;
  border-bottom: 1px solid rgba(105, 129, 161, 0.2);
}

.menu-side-panel__list,
.submenu-side-panel__list {
  display: grid;
  gap: 2px;
  padding: 0;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.menu-side-panel__item,
.submenu-side-panel__item {
  margin-bottom: 0;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.menu-side-panel__item :deep(.v-list-item__content),
.submenu-side-panel__item :deep(.v-list-item__content),
.menu-side-panel__item :deep(.v-list-item-title),
.submenu-side-panel__item :deep(.v-list-item-title) {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.menu-side-panel__item :deep(a),
.submenu-side-panel__item :deep(a) {
  display: block;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

:deep(.menu-side-menu__content),
:deep(.submenu-side-menu__content) {
  box-shadow: none !important;
  overflow: hidden !important;
  overflow-x: hidden !important;
  overflow-y: hidden !important;
  max-width: 272px;
  width: 272px !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  scrollbar-width: none;
}

:deep(.v-overlay__content.menu-side-menu__content),
:deep(.v-overlay__content.submenu-side-menu__content) {
  overflow: hidden !important;
  overflow-x: hidden !important;
  overflow-y: hidden !important;
  max-width: 272px !important;
  width: 272px !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  scrollbar-width: none;
}

:deep(.menu-side-menu__content::-webkit-scrollbar),
:deep(.submenu-side-menu__content::-webkit-scrollbar),
:deep(.v-overlay__content.menu-side-menu__content::-webkit-scrollbar),
:deep(.v-overlay__content.submenu-side-menu__content::-webkit-scrollbar) {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
}

:deep(.menu-side-menu__content .simplebar-content-wrapper),
:deep(.submenu-side-menu__content .simplebar-content-wrapper),
:deep(.menu-side-menu__content .simplebar-mask),
:deep(.submenu-side-menu__content .simplebar-mask),
:deep(.menu-side-menu__content .simplebar-offset),
:deep(.submenu-side-menu__content .simplebar-offset) {
  overflow-x: hidden !important;
}

@media (max-width: 959px) {
  .menu-parent-item,
  .menu-leaf-item {
    min-height: 44px;
  }
}
</style>
