<script type="ts" setup>
import { getChartColorsArray } from "@/app/common/chartColorArray";
import { ref, watch, computed } from "vue";
import { getCharts } from "@/components/apexCharts/rangeArea/utils"
import { useLayoutStore } from "@/store/app";

const state = useLayoutStore();
const layoutTheme = computed(() => state.layoutTheme);

const charts = ref(getCharts(getChartColorsArray));
const basicRangeAreaChart = ref(charts.value.basicRangeAreaChart);
const comboChart = ref(charts.value.comboChart);

watch(layoutTheme, () => {
  basicRangeAreaChart.value = null;
  comboChart.value = null;
  setTimeout(() => {
    const chartsVal = getCharts(getChartColorsArray);
    comboChart.value = chartsVal.comboChart;
  }, 200);
});
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Basic Range Area Chart">
        <v-card-text>
          <apexchart
            v-if="basicRangeAreaChart"
            class="apex-charts"
            height="350"
            dir="ltr"
            :series="basicRangeAreaChart.series"
            :options="basicRangeAreaChart.chartOptions"
          ></apexchart>
        </v-card-text>
      </Card>
    </v-col>

    <v-col cols="12" lg="6">
      <Card title="Scatter - Datetime Chart">
        <v-card-text>
          <div>
            <apexchart
              v-if="comboChart"
              class="apex-charts"
              height="350"
              dir="ltr"
              :series="comboChart.series"
              :options="comboChart.chartOptions"
            ></apexchart>
          </div>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
