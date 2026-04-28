<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import MenuComponents from "@/components/layouts/leftSideBar/verticalLayout/MenuComponents.vue";
import RailMenuComponent from "@/components/layouts/leftSideBar/verticalLayout/RailMenuComponent.vue";
import QuerySearch from "@/components/layouts/leftSideBar/verticalLayout/QuerySearch.vue";
import { useLayoutStore } from "@/store/app";
import {
  LAYOUTS,
  SIDEBAR_SIZE,
  LAYOUT_POSITION,
  LAYOUT_THEME,
  DIR
} from "@/app/const";

const state = useLayoutStore();

const mobileNavigationDrawer = ref(false);
const searchQuery = ref("");

const isDesktopDrawerVisible = computed(() => {
  return state.layoutType === LAYOUTS.VERTICAL && !isSmallSideBar.value;
});

const isSmallSideBar = computed(() => {
  return state.sideBarSize === SIDEBAR_SIZE.SMALL;
});

const isCompactSideBar = computed(() => {
  return state.sideBarSize === SIDEBAR_SIZE.COMPACT;
});

const isScrollableLayout = computed(() => {
  return state.position === LAYOUT_POSITION.SCROLLABLE;
});

const sideBarSize = computed(() => {
  return state.sideBarSize;
});

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});

const verticalDrawerWidth = computed(() => {
  if (isCompactSideBar.value) {
    return 188;
  } else if (state.layoutTheme === LAYOUT_THEME.INTERACTION) {
    return 268;
  }

  return 280;
});

watch(sideBarSize, () => {
  mobileNavigationDrawer.value = !mobileNavigationDrawer.value;
});
</script>

<template>
  <v-navigation-drawer
    v-if="$vuetify.display.smAndUp && isDesktopDrawerVisible"
    :width="verticalDrawerWidth"
    :absolute="isScrollableLayout"
    permanent
    :location="!isRtl ? 'start' : 'end'"
    class="vertical-navigation-drawer"
    style="height: unset !important"
  >
    <div class="app-menu navbar-menu h-100">
      <div class="navbar-brand-box premium-brand-box">
        <router-link to="/" class="logo logo-dark premium-brand-box__logo">
          <span class="logo-sm">
            <img src="@/assets/images/logo-sm.png" alt="" height="44" width="138" style="opacity: 0.9;" />
          </span>
          <span class="logo-lg">
            <img src="@/assets/images/logo-sm.png" alt="" height="44" width="138" style="opacity: 0.9;" />
          </span>
        </router-link>
        <router-link to="/" class="logo logo-light premium-brand-box__logo">
          <span class="logo-sm">
            <img src="@/assets/images/logo-sm.png" alt="" height="44" width="138" style="opacity: 0.9;" />
          </span>
          <span class="logo-lg">
            <img src="@/assets/images/logo-sm.png" alt="" height="44" width="138" style="opacity: 0.9;" />
          </span>
        </router-link>
      </div>

      <div class="sidebar-search-box">
        <QuerySearch v-model="searchQuery" />
      </div>

      <div
        data-simplebar
        id="scrollbar"
        ref="scrollbar"
        class="vertical-layout-sidebar"
        :style="!isScrollableLayout ? 'height: calc(100vh - 104px)' : ''"
      >
        <MenuComponents v-model="searchQuery" />
      </div>
      <div class="sidebar-background"></div>
    </div>
  </v-navigation-drawer>

  <v-navigation-drawer
    v-else
    v-model="mobileNavigationDrawer"
    :width="280"
    temporary
    :location="!isRtl ? 'start' : 'end'"
    class="vertical-navigation-drawer vertical-navigation-drawer--mobile"
  >
    <div class="app-menu navbar-menu">
      <div class="navbar-brand-box premium-brand-box">
        <router-link to="/" class="logo logo-dark premium-brand-box__logo">
          <span class="logo-sm">
            <img src="@/assets/images/logo-sm.png" alt="" height="44" width="138" style="opacity: 0.9;" />
          </span>
          <span class="logo-lg">
            <img src="@/assets/images/logo-sm.png" alt="" height="44" width="138" style="opacity: 0.9;" />
          </span>
        </router-link>
        <router-link to="/" class="logo logo-light premium-brand-box__logo">
          <span class="logo-sm">
            <img src="@/assets/images/logo-sm.png" alt="" height="44" width="138" style="opacity: 0.9;" />
          </span>
          <span class="logo-lg">
            <img src="@/assets/images/logo-sm.png" alt="" height="44" width="138" style="opacity: 0.9;" />
          </span>
        </router-link>
      </div>

      <div class="sidebar-search-box">
        <QuerySearch v-model="searchQuery" />
      </div>

      <div
        data-simplebar
        id="scrollbar"
        ref="scrollbar"
        class="mobile-navigation-drawer"
        :style="$vuetify.display.smAndUp ? 'height: calc(100vh - 104px)' : 'height: calc(100vh - 104px)'"
      >
        <MenuComponents v-model="searchQuery" />
      </div>
      <div class="sidebar-background"></div>
    </div>
  </v-navigation-drawer>

  <v-navigation-drawer
    v-if="$vuetify.display.smAndUp && !isDesktopDrawerVisible"
    v-model="isSmallSideBar"
    :rail-width="72"
    :location="isRtl ? 'end' : 'start'"
    rail
    permanent
    class="vertical-navigation-drawer-rail"
    style="height: unset !important"
  >
    <div class="d-flex justify-center navbar-brand-box">
      <v-btn icon href="/" class="logo" variant="text">
        <img src="@/assets/images/logo-sm.png" alt="" height="22" />
      </v-btn>
    </div>
    <v-divider />
    <div
      data-simplebar
      id="rail-scrollbar"
      :style="!isScrollableLayout ? 'height: calc(100vh - 100px)' : ''"
    >
      <RailMenuComponent />
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.vertical-navigation-drawer {
  border: 0;
}

.vertical-navigation-drawer :deep(.v-navigation-drawer__content) {
  background:
    radial-gradient(circle at top left, rgba(79, 156, 247, 0.16), transparent 20%),
    linear-gradient(180deg, #0b1422 0%, #101a2b 52%, #0b1523 100%);
  border-right: 1px solid rgba(105, 129, 161, 0.24);
  overflow: hidden;
}

.vertical-navigation-drawer :deep(.app-menu) {
  position: relative;
  background: transparent;
}

.vertical-navigation-drawer :deep(.sidebar-background) {
  display: none;
}

.premium-brand-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 70px;
  margin: 0 16px 10px;
  padding: 0;
  border-bottom: 1px solid rgba(105, 129, 161, 0.24);
}

.premium-brand-box__logo {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.vertical-layout-sidebar,
.mobile-navigation-drawer {
  padding-inline: 14px;
  padding-bottom: 16px;
}

.sidebar-search-box {
  padding: 0 14px 12px;
}

.vertical-navigation-drawer-rail :deep(.v-navigation-drawer__content) {
  background: linear-gradient(180deg, #0b1422 0%, #101b2b 100%);
  border-right: 1px solid rgba(105, 129, 161, 0.24);
}

@media (max-width: 959px) {
  .premium-brand-box {
    min-height: 70px;
    margin: 0 14px 8px;
    padding: 0;
  }
}
</style>
