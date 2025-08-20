<script lang="ts" setup>
import { ref, computed } from "vue";
import { menuItems } from "@/components/layouts/utils";
import { MenuItemType, SubMenuItemType } from "@/components/layouts/types";
import { useLayoutStore } from "@/store/app";
import { SIDEBAR_SIZE, DIR } from "@/app/const";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const path = computed(() => route.path);

const { DEFAULT, SMALL } = SIDEBAR_SIZE;

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});

// @ts-ignore
const selectedMenuItem: MenuItemType[] = computed(() => {
  return menuItems.find((data) => {
    if (data.link === path.value) {
      return data;
    } else {
      return data.subMenu?.find((subItem) => {
        if (subItem.link === path.value) {
          return subItem;
        } else {
          const data = subItem.subMenu?.find((nestedItem) => {
            return nestedItem.link === path.value;
          });
          return data;
        }
      });
    }
  });
});

// @ts-ignore
const sideBarData = ref<SubMenuItemType[]>(selectedMenuItem.value.subMenu);
const state = useLayoutStore();

const isSideBar = computed(() => {
  return state.sideBarSize === DEFAULT && sideBarData.value?.length;
});

const onSelect = (data: MenuItemType) => {
  sideBarData.value = data.subMenu || [];
  if (data.subMenu) {
    state.changeSideBarSize(DEFAULT);
  } else {
    state.changeSideBarSize(SMALL);
  }
};

const onClick = (path: string) => {
  router.push(path);
};

const isActive = (item: MenuItemType) => {
  if (sideBarData.value) {
    // @ts-ignore
    return item.id === selectedMenuItem.value.id;
  } else {
    return item.link === path.value;
  }
};
</script>
<template>
  <div class="rail-menu-wrapper">
    <v-navigation-drawer
      :rail-width="70"
      rail
      permanent
      class="rail-menu"
      :location="!isRtl ? 'start' : 'end'"
    >
      <div class="d-flex justify-center navbar-brand-box">
        <v-btn to="/" class="logo" variant="text">
          <v-img
            src="@/assets/images/logo-sm.png"
            alt=""
            height="22"
            width="22"
          />
        </v-btn>
      </div>
      <div
        data-simplebar
        id="rail-scrollbar"
        style="max-height: calc(100% - 60px)"
      >
        <v-list>
          <div v-for="menuItem in menuItems" :key="menuItem.id">
            <v-list-item
              v-if="!menuItem.isHeader"
              variant="text"
              dark
              class="rail-main-menu rail-main-menu-icon"
              :value="menuItem.id"
              :to="menuItem.link"
              :active="isActive(menuItem)"
              @click="onSelect(menuItem)"
            >
              <i
                v-if="!menuItem.isHeader"
                class="ph ph-xl"
                :class="menuItem.icon"
              />
            </v-list-item>
          </div>
        </v-list>
      </div>
    </v-navigation-drawer>
  </div>

  <v-navigation-drawer
    v-if="isSideBar"
    :width="220"
    color="primary"
    permanent
    :location="!isRtl ? 'start' : 'end'"
  >
    <div class="app-menu navbar-menu h-100">
      <div class="sidebar-background"></div>
      <div class="navbar-brand-box">
        <router-link to="/" class="logo logo-dark">
          <span class="logo-sm">
            <img src="@/assets/images/logo-sm.png" alt="" height="22" />
          </span>
          <span class="logo-lg">
            <img src="@/assets/images/logo-dark.png" alt="" height="22" />
          </span>
        </router-link>
        <router-link to="/" class="logo logo-light">
          <span class="logo-sm">
            <img src="@/assets/images/logo-sm.png" alt="" height="22" />
          </span>
          <span class="logo-lg">
            <img src="@/assets/images/logo-light.png" alt="" height="22" />
          </span>
        </router-link>
        <v-btn text="" class="header-item btn-vertical-sm-hover">
          <i class="ri-record-circle-line"></i>
        </v-btn>
      </div>
      <v-list
        class="navbar-nav two-col-layout-sidebar"
        id="navbar-nav"
        density="compact"
      >
        <v-list-group
          v-for="(subMenu, index) in sideBarData"
          :key="`submenu-${subMenu.label}-${index}`"
          class="py-0 nav nav-sm"
          height="37"
          :to="subMenu.link"
          :active="subMenu.link === path"
          :value="subMenu.link"
        >
          <template #activator="{ props }">
            <v-list-item
              v-if="!subMenu.subMenu?.length"
              append-icon=""
              :to="subMenu.link"
              :active="subMenu.link === path"
              :value="subMenu.link"
              min-height="28"
              height="38"
              @click.prevent="subMenu.link && onClick(subMenu.link)"
            >
              <template #title>
                <span class="nav-link menu-link py-0">
                  {{ $t(`t-${subMenu.label}`) }}
                </span>
              </template>
            </v-list-item>
            <v-list-item v-bind="props" v-if="subMenu.subMenu?.length">
              <template #title>
                <span class="nav-link menu-link py-0">
                  {{ $t(`t-${subMenu.label}`) }}
                </span>
              </template>
            </v-list-item>
          </template>
          <v-list-item
            v-for="(nestedItem, index) in subMenu.subMenu"
            :key="index"
            class="py-0 nav nav-sm rail-navigation-list"
            density="compact"
            :to="nestedItem.link"
            min-height="38"
            height="38"
          >
            <template #title>
              <router-link
                v-if="nestedItem.link"
                :to="{ path: nestedItem.link }"
              >
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
      </v-list>
    </div>
  </v-navigation-drawer>
</template>
