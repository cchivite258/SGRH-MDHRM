<script type="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import {  getCharts } from "@/components/apexCharts/funnel/utils"
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref(getCharts(getChartColorsArray));
const funnelChart = ref(charts.value.funnelChart);
const pyramidChart = ref(charts.value.pyramidChart);

watch(layoutTheme, () => {
  chartsVal.value = null;
  pyramidChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    pyramidChart.value = chartsVal.pyramidChart;
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Funnel Chart">
        <v-card-text>
          <apexchart
            v-if="funnelChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="funnelChart.series"
            :options="funnelChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>

    <v-col cols="12" lg="6">
      <Card title="Pyramid">
        <v-card-text>
          <div>
            <apexchart
              v-if="pyramidChart"
              class="apex-charts"
              height="350"
              dir="ltr"
              :series="pyramidChart.series"
              :options="pyramidChart.chartOptions"
            ></apexchart>
          </div>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
