<script type="ts" setup>
import { ref, watch, computed } from "vue";
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { getCharts } from '@/components/apexCharts/radar/utils';
import { useLayoutStore } from "@/store/app";

const charts = ref(getCharts(getChartColorsArray));
const basicRadarChart = ref(charts.value.basicRadarChart)
const radarMultiseriesChart = ref(charts.value.radarMultiseriesChart)
const polygonRadarChart = ref(charts.value.polygonRadarChart)

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

watch(layoutTheme, () => {
  basicRadarChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    basicRadarChart.value = chartsVal.basicRadarChart;
    radarMultiseriesChart.value = chartsVal.radarMultiseriesChart;
    polygonRadarChart.value = chartsVal.polygonRadarChart;
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" md="6">
      <Card title="Basic Radar Chart">
        <v-card-text>
          <apexchart
            v-if="basicRadarChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="basicRadarChart.series"
            :options="basicRadarChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Radar Chart - Multiple series">
        <v-card-text>
          <apexchart
            v-if="radarMultiseriesChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="radarMultiseriesChart.series"
            :options="radarMultiseriesChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Radar Chart - Polygon Fill">
        <v-card-text>
          <apexchart
            v-if="polygonRadarChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="polygonRadarChart.series"
            :options="polygonRadarChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
