<script type="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { useLayoutStore } from "@/store/app";
import {getCharts  } from '@/components/apexCharts/treemap/utils'

const charts = ref(getCharts(getChartColorsArray));
const treemapChart = ref(charts.value.treemapChart)
const multiSeriesChart = ref(charts.value.multiSeriesChart)
const distributedChart = ref(charts.value.distributedChart)
const colorRangeChart = ref(charts.value.colorRangeChart)

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

watch(layoutTheme, () => {
treemapChart.value = null
multiSeriesChart.value = null
distributedChart.value = null
colorRangeChart.value = null
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
treemapChart.value = chartsVal.treemapChart
multiSeriesChart.value = chartsVal.multiSeriesChart
distributedChart.value = chartsVal.distributedChart
colorRangeChart.value = chartsVal.colorRangeChart

  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Basic Treemap Chart">
        <v-card-text>
          <apexchart
            v-if="treemapChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="treemapChart.series"
            :options="treemapChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Multi-Dimensional Treemap Chart">
        <v-card-text>
          <apexchart
            v-if="multiSeriesChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="multiSeriesChart.series"
            :options="multiSeriesChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Distributed Treemap Chart (Different Color for each Cell)">
        <v-card-text>
          <apexchart
            v-if="distributedChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="distributedChart.series"
            :options="distributedChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Treemap Chart with Color Ranges">
        <v-card-text>
          <apexchart
            v-if="colorRangeChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="colorRangeChart.series"
            :options="colorRangeChart.chartOptions"
          />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
