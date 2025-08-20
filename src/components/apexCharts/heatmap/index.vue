<script type="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { getCharts } from "@/components/apexCharts/heatmap/utils";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref(getCharts(getChartColorsArray));
const multipleSeriesHeatmapChart = ref(charts.value.multipleSeriesHeatmapChart);
const basicHeatmapChat = ref(charts.value.basicHeatmapChat);
const colorHeatmapChart = ref(charts.value.colorHeatmapChart);
const shadesHeatmapChart = ref(charts.value.shadesHeatmapChart);

watch(layoutTheme, () => {
  multipleSeriesHeatmapChart.value = null;
  basicHeatmapChat.value = null;
  colorHeatmapChart.value = null;
  shadesHeatmapChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    multipleSeriesHeatmapChart.value = chartsVal.multipleSeriesHeatmapChart;
    basicHeatmapChat.value = chartsVal.basicHeatmapChat;
    colorHeatmapChart.value = chartsVal.colorHeatmapChart;
    shadesHeatmapChart.value = chartsVal.shadesHeatmapChart;
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Basic Heatmap Chart">
        <v-card-text>
          <apexchart
            v-if="basicHeatmapChat"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="basicHeatmapChat.series"
            :options="basicHeatmapChat.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Heatmap - Multiple Series">
        <v-card-text>
          <apexchart
            v-if="multipleSeriesHeatmapChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="multipleSeriesHeatmapChart.series"
            :options="multipleSeriesHeatmapChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>

    <v-col cols="12" lg="6">
      <Card title="Heatmap Color Range">
        <v-card-text>
          <apexchart
            v-if="colorHeatmapChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="colorHeatmapChart.series"
            :options="colorHeatmapChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Heatmap - Range Without Shades">
        <v-card-text>
          <apexchart
            v-if="shadesHeatmapChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="shadesHeatmapChart.series"
            :options="shadesHeatmapChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
