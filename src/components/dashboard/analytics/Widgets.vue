<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";
import { getWidgets } from "@/components/dashboard/analytics/utils";
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const widgets = ref(getWidgets(getChartColorsArray));

watch(layoutTheme, () => {
  widgets.value = [];
  setTimeout(() => {
    widgets.value = getWidgets(getChartColorsArray);
  }, 200);
});
</script>
<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
      md="6"
      lg="3"
      v-for="(widget, index) in widgets"
      :key="'widget-' + index"
    >
      <v-card height="168">
        <v-card-title class="pb-0">
          <div class="d-flex justify-space-between align-center">
            <span class="text-subtitle-2 text-muted">{{ widget.title }}</span>
            <ListMenu
              isIcon
              :listItems="['Today', 'Last Week', 'Last Month', 'Current Year']"
            />
          </div>
        </v-card-title>
        <v-card-text class="py-0">
          <v-row no-gutters>
            <v-col cols="12" lg="5" class="d-flex flex-column">
              <CountTo
                :endVal="widget.countTo"
                :suffix="widget.suffix"
                :decimals="2"
                class="text-h5 font-weight-bold mt-auto"
              />
              <div
                class="d-flex align-center mt-auto"
                :class="widget.isSuccess ? 'text-success' : 'text-danger'"
              >
                <i v-if="widget.isSuccess" class="ph-arrow-up me-1"></i>
                <i v-else class="ph-arrow-down me-1"></i>
                {{ widget.ratio }}
              </div>
            </v-col>
            <v-col cols="12" lg="7">
              <apexchart
                class="apex-charts"
                height="110"
                dir="ltr"
                :series="widget.chart.series"
                :options="widget.chart.chartOptions"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
