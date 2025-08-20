import VerticalLayout from "@/components/layouts/rightSidebar/VerticalLayout.vue";
import HorizontalLayout from "@/components/layouts/rightSidebar/HorizontalLayout.vue";
import TwoColumn from "@/components/layouts/rightSidebar/TwoColumn.vue";

import LightMode from "@/assets/images/custom-theme/light-mode.png";
import DarkMode from "@/assets/images/custom-theme/dark-mode.png";
import Material from "@/assets/images/custom-theme/material.png";
import Creative from "@/assets/images/custom-theme/creative.png";
import Minimal from "@/assets/images/custom-theme/minimal.png";
import Modern from "@/assets/images/custom-theme/modern.png";
import Interaction from "@/assets/images/custom-theme/interaction.png";
import BrandMode from "@/assets/images/custom-theme/brand-mode.png";

import Img1 from "@/assets/images/sidebar/img-1.jpg";
import Img2 from "@/assets/images/sidebar/img-2.jpg";
import Img3 from "@/assets/images/sidebar/img-3.jpg";
import Img4 from "@/assets/images/sidebar/img-4.jpg";

import { RightSideBarOptionsType } from "@/components/layouts/rightSidebar/types";

import {
  SIDEBAR_SIZE,
  TOP_BAR,
  SIDEBAR_COLOR,
  LAYOUTS,
  LAYOUT_THEME,
  SITE_THEME,
  LAYOUT_WIDTH,
  LAYOUT_POSITION,
} from "@/app/const";
const { DEFAULT, COMPACT, SMALL } = SIDEBAR_SIZE;
const { DARK, LIGHT } = TOP_BAR;
const {
  LIGHT: lightSideBar,
  DARK: darkSideBar,
  GRADIENT,
  GRADIENT2,
  GRADIENT3,
  GRADIENT4,
} = SIDEBAR_COLOR;
const { VERTICAL, HORIZONTAL, TWO_COLUMN } = LAYOUTS;
const {
  DEFAULT: defaultSiteType,
  MATERIAL,
  CREATIVE,
  MINIMAL,
  MODERN,
  INTERACTION,
} = LAYOUT_THEME;
const { LIGHT: lightTheme, DARK: darkTheme, BRAND } = SITE_THEME;
const { FLUID } = LAYOUT_WIDTH;
const { FIXED, SCROLLABLE } = LAYOUT_POSITION;

export const layoutsOptions: RightSideBarOptionsType = {
  title: "Layout",
  subtitle: "Choose your layout",
  value: "layoutType",
  components: [
    {
      path: VerticalLayout,
      title: "Vertical",
      value: VERTICAL,
    },
    {
      path: HorizontalLayout,
      title: "Horizontal",
      value: HORIZONTAL,
    },
    {
      path: TwoColumn,
      title: "Two Column",
      value: TWO_COLUMN,
    },
  ],
};

export const themesOptions: RightSideBarOptionsType = {
  title: "Theme",
  subtitle: "Choose your suitable Theme.",
  value: "layoutTheme",
  images: [
    {
      path: LightMode,
      title: "Default",
      value: defaultSiteType,
    },
    {
      path: Material,
      title: "Material",
      value: MATERIAL,
    },
    {
      path: Creative,
      title: "Creative",
      value: CREATIVE,
    },
    {
      path: Minimal,
      title: "Minimal",
      value: MINIMAL,
    },
    {
      path: Modern,
      title: "Modern",
      value: MODERN,
    },
    {
      path: Interaction,
      title: "Interaction",
      value: INTERACTION,
    },
  ],
};

export const modesOptions: RightSideBarOptionsType = {
  title: "Color Scheme",
  subtitle: "Choose your Light or Dark Scheme.",
  value: "mode",
  images: [
    {
      path: LightMode,
      title: "Light",
      value: lightTheme,
    },
    {
      path: DarkMode,
      title: "Dark",
      value: darkTheme,
    },
    {
      path: BrandMode,
      title: "Brand",
      isBrand: true,
      value: BRAND,
    },
  ],
};

export const widthOptions: RightSideBarOptionsType = {
  title: "Layout Width",
  value: "layoutWidth",
  subtitle: "Fluid layout.",
  components: [
    {
      path: VerticalLayout,
      title: "Fluid",
      value: FLUID,
      property: {
        width: "fluid",
      },
    },
  ],
};

export const layoutPositionOptions: RightSideBarOptionsType = {
  title: "Layout Position",
  value: "position",
  subtitle: "Choose Fixed or Scrollable Layout Position.",
  tabs: [
    {
      title: "Fixed",
      value: FIXED,
    },
    {
      title: "Scrollable",
      value: SCROLLABLE,
    },
  ],
};

export const topBarColorOptions: RightSideBarOptionsType = {
  title: "Top bar Color",
  value: "topBarColor",
  subtitle: "Choose Light or Dark Top bar Color.",
  components: [
    {
      path: VerticalLayout,
      title: "Light",
      value: LIGHT,
      property: {
        topBar: LIGHT,
      },
    },
    {
      path: VerticalLayout,
      title: "Dark",
      value: DARK,
      property: {
        topBar: DARK,
      },
    },
  ],
};

export const sidebarSizeOptions: RightSideBarOptionsType = {
  title: "Sidebar Size",
  value: "sideBarSize",
  subtitle: "Choose a size of Sidebar.",
  components: [
    {
      path: VerticalLayout,
      title: "Default",
      value: DEFAULT,
      property: {
        type: DEFAULT,
      },
    },
    {
      path: VerticalLayout,
      value: COMPACT,
      title: "Compact",
      property: {
        type: COMPACT,
      },
    },
    {
      path: VerticalLayout,
      value: SMALL,
      title: "Small (Icon View)",
      property: {
        type: SMALL,
      },
    },
  ],
};

export const sidebarColorOptions: RightSideBarOptionsType = {
  title: "Sidebar Color",
  value: "sideBarColor",
  subtitle: "Choose a color of Sidebar.",
  components: [
    {
      path: VerticalLayout,
      title: "Light",
      value: lightSideBar,
      property: {
        sideBarColor: lightSideBar,
      },
    },
    {
      path: VerticalLayout,
      title: "Dark",
      value: darkSideBar,
      property: {
        sideBarColor: darkSideBar,
      },
    },
    {
      path: VerticalLayout,
      title: "Gradient",
      value: GRADIENT,
      property: {
        sideBarColor: GRADIENT,
      },
    },
  ],
};

export const sideBarImageOptions: RightSideBarOptionsType = {
  title: "Sidebar Images",
  subtitle: "Choose a image of Sidebar.",
  value: "sideBarImage",
  sideBarImages: [
    {
      src: "",
      value: "default",
    },
    {
      src: Img1,
      value: "img-1",
    },
    {
      src: Img2,
      value: "img-2",
    },
    {
      src: Img3,
      value: "img-3",
    },
    {
      src: Img4,
      value: "img-4",
    },
  ],
};

export const gradientColors: { value: string }[] = [
  { value: GRADIENT },
  { value: GRADIENT2 },
  { value: GRADIENT3 },
  { value: GRADIENT4 },
];
