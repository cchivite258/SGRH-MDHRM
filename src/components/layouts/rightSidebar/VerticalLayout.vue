<script lang="ts">
import {
  SIDEBAR_SIZE,
  TOP_BAR,
  LAYOUT_WIDTH,
  SIDEBAR_COLOR,
} from "@/app/const";
export default {
  props: {
    property: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      SIDEBAR_SIZE,
      TOP_BAR,
      LAYOUT_WIDTH,
    };
  },
  computed: {
    getSideBarSizeClass() {
      const property = this.$props.property;
      if (property) {
        const { COMPACT, SMALL } = SIDEBAR_SIZE;
        const type = property.type;
        if (type === COMPACT || type == SMALL) {
          return "pa-1";
        }
      }
      return "px-2 pa-1";
    },
    topBarClasses() {
      const property = this.$props.property;
      if (property) {
        const { DARK } = TOP_BAR;
        const topBar = property.topBar;
        if (topBar === DARK) {
          return "bg-primary";
        }
      }
      return "layout-inline-box";
    },
    sideBarClasses() {
      const property = this.$props.property;
      let classes = [];
      if (property) {
        const { SMALL, COMPACT, DEFAULT } = SIDEBAR_SIZE;
        const type = property.type || DEFAULT;
        if (type === SMALL) {
          classes.push("px-0");
        } else if (type === COMPACT || type === DEFAULT) {
          classes.push("pa-1");
        }

        const sideBarColor = property.sideBarColor;
        const { LIGHT, DARK, GRADIENT } = SIDEBAR_COLOR;
        if (sideBarColor === LIGHT) {
          classes.push("bg-white");
        } else if (sideBarColor === DARK) {
          classes.push("bg-primary");
        } else if (sideBarColor === GRADIENT) {
          classes.push("bg-vertical-gradient");
        } else {
          classes.push("bg-light");
        }
      } else {
        classes.push("pa-1");
        classes.push("bg-light");
      }

      return classes;
    },
  },
};
</script>
<template>
  <div class="layout-card">
    <label class="layout-box pa-0">
      <span class="d-flex h-100">
        <span>
          <span class="d-flex h-100 flex-column" :class="sideBarClasses">
            <span
              class="d-block layout-inline-box rounded mb-3"
              :class="getSideBarSizeClass"
            ></span>
            <span class="layout-inline-box mb-1 pt-1 ps-1"></span>
            <span class="layout-inline-box mb-1 pt-1"></span>
            <span class="layout-inline-box pt-1"></span>
          </span>
        </span>
        <span class="flex-grow-1">
          <span class="d-flex h-100 flex-column my-auto">
            <span class="d-block pa-1" :class="topBarClasses"></span>
            <span class="bg-light d-block pa-1 mt-auto"></span>
          </span>
        </span>
      </span>
    </label>
  </div>
</template>
