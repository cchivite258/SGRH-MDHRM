<script type="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { getCharts } from "@/components/apexCharts/scatter/utils";
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref(getCharts(getChartColorsArray));
const basicScatterChart = ref(charts.value.basicScatterChart);
const dateTimeScatterChart = ref(charts.value.dateTimeScatterChart);
const scatterImagesChart = ref(charts.value.scatterImagesChart);

watch(layoutTheme, () => {
  basicScatterChart.value = null;
  dateTimeScatterChart.value = null;
  scatterImagesChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    basicScatterChart.value = chartsVal.basicScatterChart;
    dateTimeScatterChart.value = chartsVal.dateTimeScatterChart;
    scatterImagesChart.value = chartsVal.scatterImagesChart;
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Basic Scatter Chart">
        <v-card-text>
          <apexchart
            v-if="basicScatterChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="basicScatterChart.series"
            :options="basicScatterChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Scatter - Datetime Chart">
        <v-card-text>
          <apexchart
            v-if="dateTimeScatterChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="dateTimeScatterChart.series"
            :options="dateTimeScatterChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Scatter Images Chart">
        <v-card-text>
          <apexchart
            v-if="scatterImagesChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="scatterImagesChart.series"
            :options="scatterImagesChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
