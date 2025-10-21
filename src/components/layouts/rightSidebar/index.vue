<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { LAYOUTS, DIR } from "@/app/const";
import {
  gradientColors,
  layoutsOptions,
  themesOptions,
  modesOptions,
  widthOptions,
  layoutPositionOptions,
  topBarColorOptions,
  sidebarSizeOptions,
  sidebarColorOptions,
  sideBarImageOptions,
} from "@/components/layouts/rightSidebar/utils";
import { useLayoutStore } from "@/store/app";
import { useTheme, useDisplay } from "vuetify";

const { smAndDown } = useDisplay();

const drawer = ref(!smAndDown.value);
const state = useLayoutStore();
const theme = useTheme();
const gradient = ref(state.sideBarColor);

watch(drawer, (newValue: boolean) => {
  const element = document.querySelector("html");
  if (element) {
    if (newValue) {
      element.style.overflow = "hidden";
    } else {
      element.style.overflow = "auto";
    }
  }
});

const layoutType = ref(state.layoutType);

const setSiteTheme = () => {
  const mode = state.mode;
  const layoutTheme = state.layoutTheme;
  if (mode === "dark") {
    theme.global.name.value =
      layoutTheme === "default"
        ? "defaultThemeDark"
        : state.layoutTheme + "Dark";
  } else {
    theme.global.name.value =
      layoutTheme === "default" ? "defaultTheme" : state.layoutTheme;
  }
};

const onComponentChange = (key: any) => {
  const value = state[`${key}`];
  switch (key) {
    case "layoutType":
      layoutType.value = value;
      state.changeLayoutType(value);
      break;

    case "layoutTheme":
      state.changeLayoutTheme(value);
      setSiteTheme();
      break;

    case "mode":
      state.changeMode(value);
      setSiteTheme();
      break;

    case "layoutWidth":
      state.changeLayoutWidth(value);
      break;

    case "position":
      state.changeLayoutPosition(value);
      break;

    case "topBarColor":
      state.changeTopBarColor(value);
      break;

    case "sideBarSize":
      state.changeSideBarSize(value);
      break;

    case "sideBarImage":
      state.changeSideBarImage(value);
      break;

    default:
      break;
  }
};

const onComponentClick = (value: any, key: any) => {
  switch (key) {
    case "layoutType":
      layoutType.value = value;
      state.changeLayoutType(value);

      break;

    case "layoutWidth":
      state.changeLayoutWidth(value);
      break;

    case "topBarColor":
      state.changeTopBarColor(value);
      break;

    case "sideBarSize":
      state.changeSideBarSize(value);
      break;

    case "sideBarColor":
      state.changeSideBarColor(value);
      gradient.value = value;
      break;

    default:
      break;
  }
};

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});

const onGradientColorChange = (gradientColor: string) => {
  gradient.value = gradientColor;
  document.documentElement.setAttribute("data-sidebar", gradientColor);
};
</script>

<template>
  <v-layout class="right-sidebar-layout">
    <div class="right-sidebar-btn">
      <v-btn class="h-100 px-0 py-2 customiser-btn text-uppercase" color="info" min-width="37" flat rounded="md"
        @click.stop="drawer = !drawer">
        <i class="ph ph-gear mb-1 customizer-icon" /> Customizer
      </v-btn>
    </div>

    <v-navigation-drawer v-model="drawer" temporary width="400" :location="isRtl ? 'start' : 'end'"
      class="right-sidebar-drawer">
      <div class="d-flex align-center bg-gradient pa-3 right-sidebar-header justify-space-between">
        <div>
          <h3 class="mb-1 text-white">Steex Builder</h3>
          <p class="text-white mb-0 right-sidebar-subtitle">
            Choose your themes & layouts etc.
          </p>
        </div>

        <v-btn icon variant="plain" class="text-white" @click.stop="drawer = !drawer">
          <i class="ph ph-x ph-lg"></i>
        </v-btn>
      </div>

      <v-divider />

      <div class="pa-5 right-sidebar-content" data-simplebar>
        <div class="mb-3">
          <h6 class="text-subtitle-2 font-weight-bold mb-1">
            {{ layoutsOptions.title }}
          </h6>
          <div class="text-muted">
            {{ layoutsOptions.subtitle }}
          </div>
          <v-radio-group v-model="state[`${layoutsOptions.value}`]" class="right-sidebar-component" color="primary"
            hide-details @change="onComponentChange(layoutsOptions.value)">
            <v-row class="mt-1 mb-3">
              <v-col v-for="(component, i) in layoutsOptions.components" cols="4" lg="4" :key="'component-' + i"
                class="position-relative right-sidebar-component-col">
                <v-radio :value="component.value">
                  <template #label>
                    <component :is="component.path" :property="component.property" @click="
                      onComponentClick(component.value, layoutsOptions.value)
                      " />
                  </template>
                </v-radio>
                <div class="text-caption font-weight-medium text-center mt-1">
                  {{ component.title }}
                </div>
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
        <div class="mb-3">
          <h6 class="text-subtitle-2 font-weight-bold mb-1 mb-1">
            {{ themesOptions.title }}
          </h6>
          <div class="text-muted">
            {{ themesOptions.subtitle }}
          </div>
          <v-radio-group v-model="state[`${themesOptions.value}`]" class="right-sidebar-component" color="primary"
            hide-details @change="onComponentChange(themesOptions.value)">
            <v-row v-if="themesOptions.images" class="mt-1 mb-3">
              <v-col v-for="(image, i) in themesOptions.images" cols="6" :key="'image-' + i"
                class="position-relative right-sidebar-component-col">
                <div class="position-relative">
                  <v-radio :value="image.value" :disabled="image.isBrand">
                    <template #label>
                      <v-img :src="image.path" :alt="image.title" class="layout-box" cover />
                    </template>
                  </v-radio>
                </div>
                <div class="text-caption font-weight-medium text-center mt-1">
                  {{ image.title }}
                </div>
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
        <div class="mb-3">
          <h6 class="text-subtitle-2 font-weight-bold mb-1 mb-1">
            {{ modesOptions.title }}
          </h6>
          <div class="text-muted">{{ modesOptions.subtitle }}</div>
          <v-radio-group v-model="state[`${modesOptions.value}`]" class="right-sidebar-component" color="primary"
            hide-details @change="onComponentChange(modesOptions.value)">
            <v-row v-if="modesOptions.images" class="mt-1 mb-3">
              <v-col v-for="(image, i) in modesOptions.images" cols="6" :key="'image-' + i"
                class="position-relative right-sidebar-component-col">
                <div class="position-relative">
                  <h5 v-if="image.isBrand" class="brand-image-text">
                    Coming Soon
                  </h5>
                  <v-radio :value="image.value" :disabled="image.isBrand">
                    <template #label>
                      <v-img :src="image.path" :alt="image.title" class="layout-box" cover />
                    </template>
                  </v-radio>
                </div>
                <div class="text-caption font-weight-medium text-center mt-1">
                  {{ image.title }}
                </div>
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
        <div class="mb-3">
          <h6 class="text-subtitle-2 font-weight-bold mb-1 mb-1">
            {{ widthOptions.title }}
          </h6>
          <div class="text-muted">{{ widthOptions.subtitle }}</div>
          <v-radio-group v-model="state[`${widthOptions.value}`]" class="right-sidebar-component" color="primary"
            hide-details @change="onComponentChange(widthOptions.value)">
            <v-row class="mt-1 mb-3">
              <v-col v-for="(component, i) in widthOptions.components" cols="4" lg="4" :key="'component-' + i"
                class="position-relative right-sidebar-component-col">
                <v-radio :value="component.value">
                  <template #label>
                    <component :is="component.path" :property="component.property" @click="
                      onComponentClick(component.value, widthOptions.value)
                      " />
                  </template>
                </v-radio>
                <div class="text-caption font-weight-medium text-center mt-1">
                  {{ component.title }}
                </div>
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
        <div class="mb-3">
          <h6 class="text-subtitle-2 font-weight-bold mb-1 mb-1">
            {{ layoutPositionOptions.title }}
          </h6>
          <div class="text-muted">
            {{ layoutPositionOptions.subtitle }}
          </div>
          <v-btn-toggle v-model="state[`${layoutPositionOptions.value}`]" color="info" divided density="compact"
            class="mt-4 mb-3" mandatory variant="tonal" @click="onComponentChange(layoutPositionOptions.value)">
            <v-btn v-for="(tab, index) in layoutPositionOptions.tabs" :key="'tab-' + index" :value="tab.value" class="">
              {{ tab.title }}
            </v-btn>
          </v-btn-toggle>
        </div>
        <div class="mb-3">
          <h6 class="text-subtitle-2 font-weight-bold mb-1 mb-1">
            {{ topBarColorOptions.title }}
          </h6>
          <div class="text-muted">{{ topBarColorOptions.subtitle }}</div>
          <v-radio-group v-model="state[`${topBarColorOptions.value}`]" class="right-sidebar-component" color="primary"
            hide-details @change="onComponentChange(topBarColorOptions.value)">
            <v-row class="mt-1 mb-3">
              <v-col v-for="(component, i) in topBarColorOptions.components" cols="4" lg="4" :key="'component-' + i"
                class="position-relative right-sidebar-component-col">
                <v-radio :value="component.value">
                  <template #label>
                    <component :is="component.path" :property="component.property" @click="
                      onComponentClick(
                        component.value,
                        topBarColorOptions.value
                      )
                      " />
                  </template>
                </v-radio>
                <div class="text-caption font-weight-medium text-center mt-1">
                  {{ component.title }}
                </div>
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
        <div class="mb-3" v-show="layoutType !== LAYOUTS.HORIZONTAL">
          <h6 class="text-subtitle-2 font-weight-bold mb-1 mb-1">
            {{ sidebarSizeOptions.title }}
          </h6>
          <div class="text-muted">{{ sidebarSizeOptions.subtitle }}</div>
          <v-radio-group v-model="state[`${sidebarSizeOptions.value}`]" class="right-sidebar-component" color="primary"
            hide-details @change="onComponentChange(sidebarSizeOptions.value)">
            <v-row class="mt-1 mb-3">
              <v-col v-for="(component, i) in sidebarSizeOptions.components" cols="4" lg="4" :key="'component-' + i"
                class="position-relative right-sidebar-component-col">
                <v-radio :value="component.value">
                  <template #label>
                    <component :is="component.path" :property="component.property" @click="
                      onComponentClick(
                        component.value,
                        sidebarSizeOptions.value
                      )
                      " />
                  </template>
                </v-radio>
                <div class="text-caption font-weight-medium text-center mt-1">
                  {{ component.title }}
                </div>
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
        <div class="mb-3" v-show="layoutType !== LAYOUTS.HORIZONTAL">
          <h6 class="text-subtitle-2 font-weight-bold mb-1 mb-1">
            {{ sidebarColorOptions.title }}
          </h6>
          <div class="text-muted">{{ sidebarColorOptions.subtitle }}</div>
          <v-radio-group v-model="state[`${sidebarColorOptions.value}`]" class="right-sidebar-component" color="primary"
            hide-details @change="onComponentChange(sidebarColorOptions.value)">
            <v-row class="mt-1 mb-3">
              <v-col v-for="(component, i) in sidebarColorOptions.components" cols="4" lg="4" :key="'component-' + i"
                class="position-relative right-sidebar-component-col">
                <v-radio :value="component.value">
                  <template #label>
                    <component :is="component.path" :property="component.property" @click="
                      onComponentClick(
                        component.value,
                        sidebarColorOptions.value
                      )
                      " />
                  </template>
                </v-radio>
                <div class="text-caption font-weight-medium text-center mt-1">
                  {{ component.title }}
                </div>
              </v-col>

              <v-col cols="12" v-if="
                sidebarColorOptions.value === 'sideBarColor' &&
                state[`${sidebarColorOptions.value}`].includes('gradient')
              " class="d-flex sidebar-color-option-wrapper bg-light">
                <v-radio-group v-model="gradient" class="right-sidebar-component d-flex" color="primary" hide-details
                  @change="onGradientColorChange(gradient)">
                  <div class="d-flex">
                    <v-radio v-for="(gradientColor, index) in gradientColors" :key="index" class="me-2"
                      :value="gradientColor.value">
                      <template #label>
                        <div class="sidebar-color-option" :class="'bg-vertical-' + gradientColor.value"></div>
                      </template>
                    </v-radio>
                  </div>
                </v-radio-group>
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
        <div class="mb-3" v-show="layoutType !== LAYOUTS.HORIZONTAL">
          <h6 class="text-subtitle-2 font-weight-bold mb-1 mb-1">
            {{ sideBarImageOptions.title }}
          </h6>
          <div class="text-muted">{{ sideBarImageOptions.subtitle }}</div>
          <v-radio-group v-if="sideBarImageOptions.sideBarImages" v-model="state[`${sideBarImageOptions.value}`]"
            color="primary" hide-details class="mt-4 mb-3 right-sidebar-component right-sidebar-image"
            @change="onComponentChange(sideBarImageOptions.value)">
            <v-row class="mt-1 mb-3" no-gutters>
              <v-col v-for="(image, i) in sideBarImageOptions.sideBarImages" cols="2" :key="'image-' + i"
                class="position-relative right-sidebar-component-col pe-2">
                <v-radio :value="image.value">
                  <template #label>
                    <div v-if="image.value === 'default'" class="sidebar-image rounded-sm sidebar-image-none">
                      <i class="ph ph-x"></i>
                    </div>
                    <v-img v-else :src="image.src" :alt="image.value" class="sidebar-image" cover />
                  </template>
                </v-radio>
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
      </div>
      <v-divider />
      <div class="right-sidebar-action">
        <v-row class="mx-2 pt-5">
          <v-col cols>
            <v-btn block variant="tonal"> Reset </v-btn>
          </v-col>
          <v-col cols>
            <v-btn color="primary" block>Buy Now</v-btn>
          </v-col>
        </v-row>
      </div>
    </v-navigation-drawer>
  
  </v-layout>
</template>
