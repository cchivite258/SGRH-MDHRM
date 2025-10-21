<script lang="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import {
  getCharts,
  overviews,
} from "@/components/eCommerce/sellersOverview/utils";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";
const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref<any>(getCharts(getChartColorsArray));
const sellersOverviewChart = ref(charts.value.sellersOverviewChart);

const btnList = ref(["ALL", "1M", "6M", "1Y"]);
const overviewType = ref(3);

watch(layoutTheme, () => {
  sellersOverviewChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    sellersOverviewChart.value = chartsVal.sellersOverviewChart;
  }, 200);
});
</script>
<template>
  <Card title="Portfolio Overview" elevation="0">
    <template #title-action>
      <v-btn-toggle
        v-model="overviewType"
        color="primary"
        variant="tonal"
        height="27"
      >
        <v-btn
          elevation="0"
          size="x-small"
          class="me-1"
          height="25"
          rounded
          v-for="btn in btnList"
          :key="btn"
        >
          {{ btn }}
        </v-btn>
      </v-btn-toggle>
    </template>
    <v-card-text>
      <v-row class="mb-5">
        <v-col
          cols="12"
          sm="6"
          lg="3"
          v-for="(overview, index) in overviews"
          :key="'portfolio-overview-' + index"
          class="border"
        >
          <div class="text-center pa-2">
            <CountTo
              :endVal="overview.value"
              :prefix="overview.prefix"
              :suffix="overview.suffix"
              :decimals="overview.decimals"
              class="font-weight-bold text-subtitle-1"
              :class="overview.color ? 'text-' + overview.color : ''"
            />
            <div class="text-muted">{{ overview.title }}</div>
          </div>
        </v-col>
      </v-row>

      <apexchart
        v-if="sellersOverviewChart"
        class="apex-charts"
        height="400"
        dir="ltr"
        :series="sellersOverviewChart.series"
        :options="sellersOverviewChart.chartOptions"
      />
    </v-card-text>
  </Card>
</template>
