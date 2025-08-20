<script type="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import {  getCharts} from "@/components/apexCharts/candlestick/utils"
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref(getCharts(getChartColorsArray));
const basicCandlestickChart = ref(charts.value.basicCandlestickChart);
const comboCandlestickBrushChart = ref(charts.value.comboCandlestickBrushChart);
const comboCandlestickChart = ref(charts.value.comboCandlestickChart);
const categoryXaxisChart = ref(charts.value.categoryXaxisChart);

watch(layoutTheme, () => {
  basicCandlestickChart.value = null;
  comboCandlestickBrushChart.value = null;
  comboCandlestickChart.value = null;
  categoryXaxisChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    basicCandlestickChart.value = chartsVal.basicCandlestickChart;
    comboCandlestickBrushChart.value = chartsVal.comboCandlestickBrushChart;
    comboCandlestickChart.value = chartsVal.comboCandlestickChart;
    categoryXaxisChart.value = chartsVal.categoryXaxisChart;
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Basic Candlestick Chart">
        <v-card-text>
          <apexchart
            v-if="basicCandlestickChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="basicCandlestickChart.series"
            :options="basicCandlestickChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Candlestick Synced with Brush Chart (Combo)">
        <v-card-text>
          <apexchart
            v-if="comboCandlestickBrushChart"
            class="apex-charts"
            height="200"
            dir="ltr"
            :series="comboCandlestickBrushChart.series"
            :options="comboCandlestickBrushChart.chartOptions"
          />
          <apexchart
            v-if="comboCandlestickChart"
            class="apex-charts"
            height="150"
            dir="ltr"
            :series="comboCandlestickChart.series"
            :options="comboCandlestickChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Category X-Axis">
        <v-card-text>
          <apexchart
            v-if="categoryXaxisChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="categoryXaxisChart.series"
            :options="categoryXaxisChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
