<script lang="ts" setup>
import { computed } from "vue";
import { useDisplay } from "vuetify";
import { useLayoutStore } from "@/store/app";
import { LAYOUTS } from "@/app/const";
import VerticalNavDrawer from "@/components/layouts/leftSideBar/verticalLayout/index.vue";
import TwoColumNavDrawer from "@/components/layouts/leftSideBar/twoColumnLayout/index.vue";

const { xs } = useDisplay();
const state = useLayoutStore();

const { VERTICAL, TWO_COLUMN } = LAYOUTS;

const isVertical = computed(() => {
  return state.layoutType === VERTICAL;
});
const isTwoColumn = computed(() => {
  return state.layoutType === TWO_COLUMN;
});
</script>
<template>
  <VerticalNavDrawer v-if="isVertical || xs" />
  <TwoColumNavDrawer v-if="isTwoColumn && !xs" />
</template>
