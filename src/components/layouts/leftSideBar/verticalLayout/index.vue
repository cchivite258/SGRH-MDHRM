<script lang="ts" setup>
import { computed, ref } from "vue";
import MenuComponents from "@/components/layouts/leftSideBar/verticalLayout/MenuComponents.vue";
import RailMenuComponent from "@/components/layouts/leftSideBar/verticalLayout/RailMenuComponent.vue";
import { useLayoutStore } from "@/store/app";
import {
  LAYOUTS,
  SIDEBAR_SIZE,
  LAYOUT_POSITION,
  LAYOUT_THEME,
  DIR
} from "@/app/const";
import { watch } from "vue";

const state = useLayoutStore();

const mobileNavigationDrawer = ref(false);

const navigationDrawer = computed(() => {
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
    return 180;
  } else if (state.layoutTheme === LAYOUT_THEME.INTERACTION) {
    return 230;
  }

  return 250;
});

watch(sideBarSize, () => {
  mobileNavigationDrawer.value = !mobileNavigationDrawer.value;
});
</script>
<template>
  <v-navigation-drawer v-if="$vuetify.display.smAndUp" v-model="navigationDrawer" :width="verticalDrawerWidth"
    :absolute="isScrollableLayout" :permanent="$vuetify.display.smAndUp" :location="!isRtl ? 'start' : 'end'" temporary
    :style="isScrollableLayout ? 'overflow-y: auto' : 'height: unset !important'
      ">
    <div class="app-menu navbar-menu h-100">
      <div class="navbar-brand-box">
        <router-link to="/" class="logo logo-dark">
          <span class="logo-sm">
            <img src="@/assets/images/logo-sm.png" alt="" height="50" width="150" style="opacity: 0.8;" />
          </span>
          <span class="logo-lg">
            <img src="@/assets/images/logo-sm.png" alt="" height="50" width="150" style="opacity: 0.8;" />
          </span>
        </router-link>
        <router-link to="/" class="logo logo-light">
          <span class="logo-sm">
            <img src="@/assets/images/logo-sm.png" alt="" height="50" width="150" style="opacity: 0.8;" />
          </span>
          <span class="logo-lg">
            <img src="@/assets/images/logo-sm.png" alt="" height="50" width="150" style="opacity: 0.8;" />
          </span>
        </router-link>
        <v-btn text="" class="header-item btn-vertical-sm-hover">
          <i class="ri-record-circle-line"></i>
        </v-btn>
      </div>

      <div data-simplebar id="scrollbar" :style="!isScrollableLayout ? 'height: calc(100vh - 75px)' : ''"
        ref="scrollbar" class="vertical-layout-sidebar">
        <MenuComponents />
      </div>
      <div class="sidebar-background"></div>
    </div>
  </v-navigation-drawer>

  <v-navigation-drawer v-else v-model="mobileNavigationDrawer" :width="250" temporary
    :location="!isRtl ? 'start' : 'end'">
    <div class="app-menu navbar-menu">
      <div class="navbar-brand-box">
        <router-link to="/" class="logo logo-dark">
          <span class="logo-sm">
            <img src="@/assets/images/logo-sm.png" alt="" height="50" width="150" style="opacity: 0.8;" />
          </span>
          <span class="logo-lg">
            <img src="@/assets/images/logo-sm.png" alt="" height="50" width="150" style="opacity: 0.8;" />
          </span>
        </router-link>
        <router-link to="/" class="logo logo-light">
          <span class="logo-sm">
            <img src="@/assets/images/logo-sm.png" alt="" height="50" width="150" style="opacity: 0.8;" />
          </span>
          <span class="logo-lg">
            <img src="@/assets/images/logo-sm.png" alt="" height="50" width="150" style="opacity: 0.8;" />
          </span>
        </router-link>
        <v-btn text="" class="header-item btn-vertical-sm-hover">
          <i class="ri-record-circle-line"></i>
        </v-btn>
      </div>

      <div data-simplebar id="scrollbar" :style="$vuetify.display.smAndUp
        ? (!isScrollableLayout && 'height: calc(100vh - 80px);') || ''
        : 'height: 100vh'
        " ref="scrollbar" class="mobile-navigation-drawer">
        <MenuComponents />
      </div>
      <div class="sidebar-background"></div>
    </div>
  </v-navigation-drawer>

  <v-navigation-drawer v-if="$vuetify.display.smAndUp && !navigationDrawer" v-model="isSmallSideBar" :rail-width="70"
    :location="isRtl ? 'end' : 'start'" rail permanent class="vertical-navigation-drawer-rail"
    style="height: unset !important">
    <div class="d-flex justify-center navbar-brand-box">
      <v-btn icon href="/" class="logo" variant="text">
        <img src="@/assets/images/logo-sm.png" alt="" height="22" />
      </v-btn>
    </div>
    <v-divider />
    <div data-simplebar id="rail-scrollbar" :style="!isScrollableLayout ? 'height: calc(100vh - 100px)' : ''">
      <RailMenuComponent />
    </div>
  </v-navigation-drawer>
</template>
